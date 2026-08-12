import smtplib
from email.mime.text import MIMEText

# Credentials
email_user = "sultanmujtabaahmedawan@gmail.com"
app_password = "gyqplkogtjdtzpcf"

print(f"Testing SMTP login for {email_user}...")

try:
    # Set up the server
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    
    # Login
    server.login(email_user, app_password)
    print("SUCCESS! The App Password is correct and Gmail allowed the connection.")
    
    # Send a quick test email to yourself
    msg = MIMEText("This is a test email to verify SMTP is working.")
    msg['Subject'] = "Test from Python"
    msg['From'] = email_user
    msg['To'] = email_user
    
    server.send_message(msg)
    print("Test email sent successfully to your own inbox!")
    
    server.quit()
except smtplib.SMTPAuthenticationError:
    print("ERROR: Authentication failed! The App Password is incorrect, or Google is blocking it.")
except Exception as e:
    print(f"ERROR: Something else went wrong: {e}")
