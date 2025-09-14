import requests, hashlib
from typing import Dict, Any

class KiteClient:
    def __init__(self, api_key: str, api_secret: str, access_token: str | None = None):
        self.api_key = api_key
        self.api_secret = api_secret
        self.access_token = access_token
        self.root = "https://api.kite.trade"
        self.session = requests.Session()
        self.session.headers.update({
            "X-Kite-Version": "3",
            "User-Agent": "zerodha-xirr-app/0.1",
        })
        if access_token:
            self.session.headers.update({"Authorization": f"token {api_key}:{access_token}"})

    def generate_session(self, request_token: str) -> Dict[str, Any]:
        url = "https://api.kite.trade/session/token"
        # Plain SHA-256 of api_key + request_token + api_secret (NOT HMAC)
        checksum_bytes = f"{self.api_key}{request_token}{self.api_secret}".encode("utf-8")
        checksum = hashlib.sha256(checksum_bytes).hexdigest()

        resp = self.session.post(url, data={
            "api_key": self.api_key,
            "request_token": request_token,
            "checksum": checksum
        })
        j = resp.json()
        if resp.status_code != 200 or "data" not in j:
            # surface the real Kite error message if any
            raise Exception(j.get("message", f"HTTP {resp.status_code}"))
        self.access_token = j["data"]["access_token"]
        self.session.headers.update({"Authorization": f"token {self.api_key}:{self.access_token}"})
        return j["data"]

    def get_holdings(self):
        if not self.access_token:
            raise Exception("Access token not set")
        url = f"{self.root}/portfolio/holdings"
        r = self.session.get(url)
        j = r.json()
        if "data" not in j:
            raise Exception(j.get("message", "Failed to fetch holdings"))
        return j["data"]

# import requests, hashlib, hmac, time
# from typing import Dict, Any

# class KiteClient:
#     def __init__(self, api_key: str, api_secret: str, access_token: str | None = None):
#         self.api_key = api_key
#         self.api_secret = api_secret
#         self.access_token = access_token
#         self.root = "https://api.kite.trade"
#         self.session = requests.Session()
#         self.session.headers.update({
#             "X-Kite-Version": "3",
#             "User-Agent": "zerodha-xirr-app/0.1"
#         })
#         if access_token:
#             self.session.headers.update({"Authorization": f"token {api_key}:{access_token}"})

#     def generate_session(self, request_token: str) -> Dict[str, Any]:
#         url = "https://api.kite.trade/session/token"
#         checksum_str = f"{self.api_key}{request_token}{self.api_secret}".encode("utf-8")
#         checksum = hmac.new(self.api_secret.encode("utf-8"), checksum_str, hashlib.sha256).hexdigest()
#         resp = self.session.post(url, data={
#             "api_key": self.api_key,
#             "request_token": request_token,
#             "checksum": checksum
#         })
#         data = resp.json()
#         if "data" not in data:
#             raise Exception(data.get("message", "Invalid response"))
#         self.access_token = data["data"]["access_token"]
#         self.session.headers.update({"Authorization": f"token {self.api_key}:{self.access_token}"})
#         return data["data"]

#     def get_holdings(self):
#         if not self.access_token:
#             raise Exception("Access token not set")
#         url = f"{self.root}/portfolio/holdings"
#         r = self.session.get(url)
#         j = r.json()
#         if "data" not in j:
#             raise Exception(j.get("message", "Failed to fetch holdings"))
#         return j["data"]
