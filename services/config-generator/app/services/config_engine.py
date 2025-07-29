import asyncio
import os
import tempfile
import yaml
from typing import Dict, Any, List, Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape
import uuid
import structlog
from datetime import datetime

from app.models.config import (
    ConfigGenerationRequest, ConfigJob, JobStatus, 
    DeploymentRequest, DeploymentResult, ConfigType
)
from app.core.dependencies import get_database_connections
from app.core.config import settings

logger = structlog.get_logger()


class ConfigurationEngine:
    """Configuration generation and deployment engine."""
    
    def __init__(self):
        self.db_connections = get_database_connections()
        self.jinja_env = Environment(
            loader=FileSystemLoader('templates'),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    async def generate_configurations(
        self, 
        request: ConfigGenerationRequest
    ) -> ConfigJob:
        """Generate network configurations."""
        job_id = str(uuid.uuid4())
        
        logger.info(
            "Starting configuration generation",
            job_id=job_id,
            simulation_id=request.simulation_id,
            targets=request.targets,
            config_type=request.config_type.value
        )
        
        job = ConfigJob(
            job_id=job_id,
            status=JobStatus.RUNNING,
            request=request
        )
        
        try:
            # Cache initial job
            await self._cache_config_job(job)
            
            # Start generation process in background
            asyncio.create_task(self._run_config_generation(job))
            
            return job
            
        except Exception as e:
            logger.error("Failed to start config generation", error=str(e))
            job.status = JobStatus.FAILED
            job.errors.append(str(e))
            await self._cache_config_job(job)
            return job
    
    async def _run_config_generation(self, job: ConfigJob):
        """Run the actual configuration generation process."""
        try:
            # Generate device-specific configurations
            configs = await self._generate_device_configs(job.request)
            job.generated_configs = configs
            
            # Generate Ansible playbook
            playbook = await self._generate_ansible_playbook(job.request, configs)
            job.ansible_playbook = playbook
            
            # Update job status
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            
            logger.info(
                "Configuration generation completed",
                job_id=job.job_id,
                configs_generated=len(configs)
            )
            
        except Exception as e:
            logger.error("Configuration generation failed", error=str(e))
            job.status = JobStatus.FAILED
            job.errors.append(str(e))
            job.completed_at = datetime.utcnow()
        
        finally:
            await self._cache_config_job(job)
    
    async def _generate_device_configs(
        self, 
        request: ConfigGenerationRequest
    ) -> Dict[str, str]:
        """Generate device-specific configurations."""
        configs = {}
        
        for target in request.targets:
            try:
                # Get device info (mock for demo)
                device_info = await self._get_device_info(target)
                
                # Generate configuration based on type
                if request.config_type == ConfigType.QOS:
                    config = self._generate_qos_config(device_info, request.parameters)
                elif request.config_type == ConfigType.ROUTING:
                    config = self._generate_routing_config(device_info, request.parameters)
                else:
                    config = self._generate_basic_config(device_info, request.parameters)
                
                configs[target] = config
                
            except Exception as e:
                logger.error(f"Failed to generate config for {target}", error=str(e))
                configs[target] = f"# Error generating config: {str(e)}"
        
        return configs
    
    async def _get_device_info(self, device_id: str) -> Dict[str, Any]:
        """Get device information (mock for demo)."""
        # In real implementation, this would query Neo4j for device details
        device_configs = {
            "R1": {"vendor": "cisco", "model": "ISR4331", "os": "ios"},
            "R2": {"vendor": "cisco", "model": "ISR4331", "os": "ios"},
            "R3": {"vendor": "juniper", "model": "SRX300", "os": "junos"},
            "R4": {"vendor": "cisco", "model": "ASR1001", "os": "ios"},
            "R5": {"vendor": "juniper", "model": "SRX300", "os": "junos"},
        }
        
        return device_configs.get(device_id, {
            "vendor": "cisco", 
            "model": "unknown", 
            "os": "ios"
        })
    
    def _generate_qos_config(
        self, 
        device_info: Dict[str, Any], 
        parameters: Dict[str, Any]
    ) -> str:
        """Generate QoS configuration."""
        vendor = device_info.get("vendor", "cisco").lower()
        
        if vendor == "cisco":
            return self._generate_cisco_qos_config(parameters)
        elif vendor == "juniper":
            return self._generate_juniper_qos_config(parameters)
        else:
            return "# QoS configuration not supported for this vendor"
    
    def _generate_cisco_qos_config(self, parameters: Dict[str, Any]) -> str:
        """Generate Cisco QoS configuration."""
        config = """
! QoS Configuration for VoIP Protection
policy-map VOICE-POLICY
 class class-default
  bandwidth percent 60
  queue-limit 64 packets
 class VOICE-CLASS
  priority percent 30
  queue-limit 32 packets
 class CRITICAL-DATA
  bandwidth percent 10
  queue-limit 16 packets

class-map match-any VOICE-CLASS
 match dscp ef
 match protocol rtp

class-map match-any CRITICAL-DATA
 match dscp af31
 match dscp af21

! Apply to interfaces
interface GigabitEthernet0/0
 service-policy output VOICE-POLICY

interface GigabitEthernet0/1
 service-policy output VOICE-POLICY
"""
        return config.strip()
    
    def _generate_juniper_qos_config(self, parameters: Dict[str, Any]) -> str:
        """Generate Juniper QoS configuration."""
        config = """
# QoS Configuration for VoIP Protection
class-of-service {
    forwarding-classes {
        queue 0 voice priority high;
        queue 1 data priority medium;
        queue 2 best-effort priority low;
    }
    
    interfaces {
        ge-0/0/0 {
            scheduler-map voice-scheduler;
        }
        ge-0/0/1 {
            scheduler-map voice-scheduler;
        }
    }
    
    scheduler-maps {
        voice-scheduler {
            forwarding-class voice scheduler voice-sched;
            forwarding-class data scheduler data-sched;
            forwarding-class best-effort scheduler be-sched;
        }
    }
    
    schedulers {
        voice-sched {
            transmit-rate percent 30;
            buffer-size percent 10;
            priority high;
        }
        data-sched {
            transmit-rate percent 60;
            buffer-size percent 70;
            priority medium;
        }
        be-sched {
            transmit-rate percent 10;
            buffer-size percent 20;
            priority low;
        }
    }
}
"""
        return config.strip()
    
    def _generate_routing_config(
        self, 
        device_info: Dict[str, Any], 
        parameters: Dict[str, Any]
    ) -> str:
        """Generate routing configuration."""
        return """
! Basic routing configuration
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
 passive-interface default
 no passive-interface GigabitEthernet0/0
 no passive-interface GigabitEthernet0/1
"""
    
    def _generate_basic_config(
        self, 
        device_info: Dict[str, Any], 
        parameters: Dict[str, Any]
    ) -> str:
        """Generate basic configuration."""
        return """
! Basic configuration
hostname {device_id}
!
interface GigabitEthernet0/0
 description "Uplink Interface"
 no shutdown
!
interface GigabitEthernet0/1  
 description "LAN Interface"
 no shutdown
""".format(device_id=parameters.get("device_id", "Router"))
    
    async def _generate_ansible_playbook(
        self, 
        request: ConfigGenerationRequest, 
        configs: Dict[str, str]
    ) -> str:
        """Generate Ansible playbook for deployment."""
        
        playbook_tasks = []
        
        for device_id, config in configs.items():
            task = {
                "name": f"Deploy configuration to {device_id}",
                "cisco.ios.ios_config" if "cisco" in config.lower() else "junipernetworks.junos.junos_config": {
                    "src": f"configs/{device_id}.cfg"
                },
                "when": f"inventory_hostname == '{device_id}'"
            }
            playbook_tasks.append(task)
        
        playbook = {
            "name": "Deploy Network Configurations",
            "hosts": "all",
            "gather_facts": False,
            "vars": {
                "ansible_connection": "network_cli",
                "ansible_network_os": "ios",  # Default to IOS
                "ansible_user": "{{ vault_username }}",
                "ansible_password": "{{ vault_password }}"
            },
            "tasks": [
                {
                    "name": "Backup current configuration",
                    "cisco.ios.ios_command": {
                        "commands": ["show running-config"]
                    },
                    "register": "backup_config"
                },
                {
                    "name": "Save backup to file",
                    "copy": {
                        "content": "{{ backup_config.stdout[0] }}",
                        "dest": f"backups/{{{{ inventory_hostname }}}}_{{{{ ansible_date_time.epoch }}}}.cfg"
                    },
                    "delegate_to": "localhost"
                }
            ] + playbook_tasks
        }
        
        return yaml.dump([playbook], default_flow_style=False)
    
    async def get_config_job(self, job_id: str) -> Optional[ConfigJob]:
        """Get configuration job status."""
        try:
            redis_client = self.db_connections["redis"]
            cached_data = redis_client.get(f"config_job:{job_id}")
            
            if cached_data:
                import json
                data = json.loads(cached_data)
                return ConfigJob.model_validate(data)
            
            return None
            
        except Exception as e:
            logger.error("Failed to get config job", error=str(e))
            return None
    
    async def deploy_configurations(
        self, 
        request: DeploymentRequest
    ) -> DeploymentResult:
        """Deploy configurations using Ansible."""
        deployment_id = str(uuid.uuid4())
        
        logger.info(
            "Starting configuration deployment",
            deployment_id=deployment_id,
            job_id=request.job_id,
            targets=request.targets
        )
        
        try:
            # Get the configuration job
            config_job = await self.get_config_job(request.job_id)
            if not config_job:
                raise ValueError("Configuration job not found")
            
            # For demo, simulate successful deployment
            results = {}
            for target in request.targets:
                results[target] = {
                    "status": "success",
                    "changes_applied": True,
                    "backup_created": True,
                    "config_lines_changed": 15
                }
            
            result = DeploymentResult(
                deployment_id=deployment_id,
                job_id=request.job_id,
                status="completed",
                results=results,
                completed_at=datetime.utcnow()
            )
            
            logger.info(
                "Configuration deployment completed",
                deployment_id=deployment_id,
                successful_targets=len(results)
            )
            
            return result
            
        except Exception as e:
            logger.error("Configuration deployment failed", error=str(e))
            return DeploymentResult(
                deployment_id=deployment_id,
                job_id=request.job_id,
                status="failed",
                results={"error": str(e)},
                completed_at=datetime.utcnow()
            )
    
    async def _cache_config_job(self, job: ConfigJob):
        """Cache configuration job in Redis."""
        try:
            redis_client = self.db_connections["redis"]
            import json
            data = job.model_dump(mode='json')
            redis_client.setex(
                f"config_job:{job.job_id}",
                7200,  # 2 hours TTL
                json.dumps(data)
            )
        except Exception as e:
            logger.error("Failed to cache config job", error=str(e))