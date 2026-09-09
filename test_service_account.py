from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    print("Testing Service Account...")
    try:
        creds = Credentials.from_service_account_file('service-account.json', scopes=SCOPES)
        service = build('drive', 'v3', credentials=creds)
        # Just fetching the About info to verify the connection works
        about = service.about().get(fields="user").execute()
        print("SUCCESS! Connected to Google Drive as Service Account:")
        print(f"Email: {about['user']['emailAddress']}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == '__main__':
    main()
