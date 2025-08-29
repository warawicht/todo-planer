// Test our password strength regex
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

console.log('Testing password strength regex:');
console.log('Test123!@#PasswordA:', strongPasswordRegex.test('Test123!@#PasswordA'));
console.log('test123!@#passworda:', strongPasswordRegex.test('test123!@#passworda'));
console.log('TEST123!@#PASSWORDA:', strongPasswordRegex.test('TEST123!@#PASSWORDA'));
console.log('Test123456:', strongPasswordRegex.test('Test123456'));
console.log('Test!@#Password:', strongPasswordRegex.test('Test!@#Password'));