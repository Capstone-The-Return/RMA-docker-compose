# Readme
## Configuration 
docker-compose.yml - Contains the common configuration for both frontend and backend<br>
docker-compose.dev.yml - Contains configuration explicitly for the local dev environments<br>
docker-compose.dev.yml - Contains configuration explicitly for the production environment

## Run on local
<pre>
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
</pre>

## App on cloud
http://56.228.22.86/

## EC2 VM Admin page
https://eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#InstanceDetails:instanceId=i-09d4f76ca3be5e510

## SSH to VM
In the folder in which the RSA key exists (Capstone-RMA-portal-VM-rsa-key.pem) run
<pre>
ssh -i Capstone-RMA-portal-VM-rsa-key.pem ubuntu@56.228.22.86
</pre>
