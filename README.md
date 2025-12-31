# Readme
## Configuration 
docker-compose.yml - Contains the common configuration for both local dev and production<br>
docker-compose.dev.yml - Contains configuration explicitly for the local dev environments<br>
docker-compose.dev.yml - Contains configuration explicitly for the production environment

## Before first run on local
There is a .env.example file in the repository. You need to make a copy of it, and name it .env. After that open the .env and add the needed values to the variables.

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

## About .env variables
<br><br>
In order for the new variables to work on production, you need to add them to the Github variables.
<pre>
RMA-docker-compose -> Settings -> Secrets and variables -> Actions -> Variables
</pre>
If the variables should be read from Vite, the name of the variable should start with VITE_..... (e.g. VITE_API_URL).