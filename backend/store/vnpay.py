import hashlib
import hmac
import urllib.parse

class vnpay:
    requestData = {}
    responseData = {}

    def get_payment_url(self, vnpay_payment_url, secret_key):
        inputData = sorted(self.requestData.items())
        queryString = ''
        seq = 0
        for key, val in inputData:
            if seq == 1:
                queryString = queryString + "&" + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                queryString = key + '=' + urllib.parse.quote_plus(str(val))
        
        # Hash HMAC SHA512
        hashValue = self.__md5(secret_key, queryString)
        return vnpay_payment_url + "?" + queryString + '&vnp_SecureHash=' + hashValue

    def validate_response(self, secret_key):
        vnp_SecureHash = self.responseData.get('vnp_SecureHash', '')
        if 'vnp_SecureHash' in self.responseData:
            self.responseData.pop('vnp_SecureHash')
        if 'vnp_SecureHashType' in self.responseData:
            self.responseData.pop('vnp_SecureHashType')
            
        inputData = sorted(self.responseData.items())
        hasData = ''
        seq = 0
        for key, val in inputData:
            if str(key).startswith('vnp_'):
                if seq == 1:
                    hasData = hasData + "&" + str(key) + '=' + urllib.parse.quote_plus(str(val))
                else:
                    seq = 1
                    hasData = str(key) + '=' + urllib.parse.quote_plus(str(val))
        
        hashValue = self.__md5(secret_key, hasData)
        return vnp_SecureHash == hashValue

    def __md5(self, secret_key, data):
        byteKey = secret_key.encode('utf-8')
        byteData = data.encode('utf-8')
        return hmac.new(byteKey, byteData, hashlib.sha512).hexdigest()