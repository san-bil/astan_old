#!/bin/bash

echo "Enter encryption passphrase to lock password for app email service."
python ../utils/encrypt_string.py $1 > hashed_email_password.txt

