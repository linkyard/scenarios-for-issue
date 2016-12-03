const Promise = require('bluebird');
const crypto = Promise.promisifyAll(require('crypto'));

//store an encryption key in our local store and the encrypted values as entity properties
// in the JIRA instance. So both data stores are required to get the value.
module.exports = function (addon) {
  function encryptionKey(req) {
    return addon.settings.get('encryption-key', req.context.clientKey)
      .then(function (key) {
        if (!key) {
          //generate new key and save it if none was found
          return crypto.randomBytesAsync(32).then(function (bytes) {
            return bytes.toString('hex');
          }).then(function (key) {
            addon.settings.set('encryption-key', key, req.context.clientKey)
              .then(function () {
                return key;
              })
          });
        } else {
          return key;
        }
      })
      .then(function (key) {
        return new Buffer(key, 'hex');
      });
  }

  const ALGORITHM = 'AES-256-CBC';

  return {
    encrypt: function (req, value) {
      return encryptionKey(req).then(function (key) {
        const iv = new Buffer(crypto.randomBytes(16));

        const encryptor = crypto.createCipheriv(ALGORITHM, key, iv);
        encryptor.setEncoding('hex');
        encryptor.write(value);
        encryptor.end();
        const cipher_text = encryptor.read();

        return cipher_text + '$' + iv.toString('hex')
      });
    },

    decrypt: function (req, encrypted) {
      if (!encrypted) return null;

      return encryptionKey(req).then(function (key) {
        const parts = encrypted.split('$');
        const cipher_text = parts[0];
        const iv = new Buffer(parts[1], 'hex');

        const decryptor = crypto.createDecipheriv(ALGORITHM, key, iv);
        const decryptedText = decryptor.update(cipher_text, 'hex', 'utf-8');
        return decryptedText + decryptor.final('utf-8');
      });
    }
  };
};