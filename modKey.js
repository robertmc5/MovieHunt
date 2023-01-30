class extraStep {
  constructor(shift) {
    this.shift = shift;
  }

  decrypt(cipher) {
    let decryptedCipher = '';
    let transformText = cipher.toLowerCase();
    for (let i = 0; i < cipher.length; i++) {
      let charCode = transformText.charCodeAt(i);
      if (charCode >= 97 && charCode <= 122) {
        charCode -= this.shift;
        if (charCode < 97) {
          charCode += 26;
        }
      }
      decryptedCipher += String.fromCharCode(charCode);
    }
    return decryptedCipher;
  }
}

const token = new extraStep(11);
export default token.decrypt('29903QM3Q056N05P5502N2N8M93O607N');
