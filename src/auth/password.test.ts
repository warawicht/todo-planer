// Test our password strength function
import { AuthService } from './auth.service';

const authService = new AuthService(null, null, null);

console.log('Testing password strength function:');
console.log('Test123!@#PasswordA:', authService.isPasswordStrong('Test123!@#PasswordA'));
console.log('test123!@#passworda:', authService.isPasswordStrong('test123!@#passworda'));
console.log('TEST123!@#PASSWORDA:', authService.isPasswordStrong('TEST123!@#PASSWORDA'));
console.log('Test123456:', authService.isPasswordStrong('Test123456'));
console.log('Test!@#Password:', authService.isPasswordStrong('Test!@#Password'));