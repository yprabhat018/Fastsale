<template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand">
        <div class="logo"></div>
        <h1>{{ appName }}</h1>
      </div>
      
      <h2 class="form-title">{{ isRegistering ? 'Create Account' : 'Welcome Back' }}</h2>
      <p class="form-subtitle">{{ isRegistering ? 'Register as a Business or Driver' : 'Log in to your account' }}</p>
      
      <div v-if="successMessage" class="success-message">
        <span>✅</span>
        <p>{{ successMessage }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <!-- Email Field -->
        <div class="input-group">
          <label for="email">Email</label>
          <div class="input-wrapper" :class="{ 'error-input': emailError }">
            <span class="input-icon">✉️</span>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              placeholder="your@email.com" 
              required 
              autocomplete="email"
              @blur="validateEmail"
            />
          </div>
          <small v-if="emailError" class="field-error">{{ emailError }}</small>
        </div>
        
        <!-- Name field for registration -->
        <div v-if="isRegistering" class="input-group">
          <label for="fullName">Full Name</label>
          <div class="input-wrapper" :class="{ 'error-input': nameError }">
            <span class="input-icon">👤</span>
            <input 
              id="fullName"
              v-model="fullName" 
              type="text" 
              placeholder="Your full name" 
              required 
              autocomplete="name"
              @blur="validateName"
            />
          </div>
          <small v-if="nameError" class="field-error">{{ nameError }}</small>
        </div>
        
        <!-- Account type selection for registration -->
        <div v-if="isRegistering" class="input-group">
          <label>Account Type</label>
          <div class="account-type-selector">
            <div 
              :class="['account-option', { active: accountType === 'business' }]" 
              @click="accountType = 'business'"
            >
              <span class="account-icon">🏢</span>
              <span>Business</span>
            </div>
            <div 
              :class="['account-option', { active: accountType === 'driver' }]" 
              @click="accountType = 'driver'"
            >
              <span class="account-icon">🚗</span>
              <span>Driver</span>
            </div>
          </div>
        </div>
        
        <!-- Password Field -->
        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-wrapper" :class="{ 'error-input': passwordError }">
            <span class="input-icon">🔒</span>
            <input 
              id="password"
              v-model="password" 
              :type="passwordVisible ? 'text' : 'password'" 
              placeholder="Your password" 
              required 
              autocomplete="current-password"
              @blur="validatePassword"
            />
            <span class="toggle-password" @click="togglePasswordVisibility">
              {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>
          <small v-if="passwordError" class="field-error">{{ passwordError }}</small>
          
          <!-- Password strength meter for registration -->
          <div v-if="isRegistering && password" class="password-strength">
            <div class="strength-label">Password Strength:</div>
            <div class="strength-meter">
              <div 
                class="strength-bar" 
                :style="{ width: `${passwordStrength.score * 25}%` }"
                :class="passwordStrength.className"
              ></div>
            </div>
            <small class="strength-text">{{ passwordStrength.text }}</small>
          </div>
        </div>
        
        <!-- Confirm Password Field for registration -->
        <div v-if="isRegistering" class="input-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-wrapper" :class="{ 'error-input': confirmPasswordError }">
            <span class="input-icon">🔒</span>
            <input 
              id="confirmPassword"
              v-model="confirmPassword" 
              :type="passwordVisible ? 'text' : 'password'" 
              placeholder="Confirm your password" 
              required 
              @blur="validateConfirmPassword"
            />
          </div>
          <small v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</small>
        </div>
        
        <!-- Terms and privacy checkbox for registration -->
        <div v-if="isRegistering" class="input-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="agreeToTerms" required />
            <span>I agree to the <a href="#" @click.prevent="showTerms">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy">Privacy Policy</a></span>
          </label>
          <small v-if="termsError" class="field-error">{{ termsError }}</small>
        </div>
        
        <div class="remember-forgot">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="showForgotPassword">Forgot password?</a>
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading || (isRegistering && (!isValidForm || !agreeToTerms))" 
          class="submit-button"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ isRegistering ? 'Create Account' : 'Log In' }}</span>
        </button>
        
        <div v-if="error" class="error-message">
          <span>⚠️</span>
          <p>{{ error }}</p>
        </div>
      </form>
      
      <div class="divider">
        <span>or continue with</span>
      </div>
      
      <div class="social-login">
        <button class="social-button google" @click="socialLogin('google')">
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
        </button>
        <button class="social-button facebook" @click="socialLogin('facebook')">
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
          </svg>
        </button>
        <button class="social-button apple" @click="socialLogin('apple')">
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12.15,4.86c.59-.63,1.73-1.12,2.71-1.12a4.25,4.25,0,0,1-1.1,3.36c-.66.69-1.58,1.06-2.55,1.06a3.25,3.25,0,0,1,1-3.3ZM14.54,8.4c.91.09,3.28,1.07,4.18,3.89a4.27,4.27,0,0,0-2.25-2.16,4.8,4.8,0,0,0-2.56-.22c-.34.05-2.33.41-2.33,2.31,0,1.65,1.51,2.11,2.86,2.11s2.28-.18,3.3.18c.8.28,2.1,1.71,2.1,3.78,0,2.85-1.81,4.69-5.57,4.69-3.31,0-6.07-2.53-6.07-5.57,0-1.7,1.2-4.59,1.2-4.59a10.49,10.49,0,0,1,5.05-4.42Z"/>
          </svg>
        </button>
      </div>
      
      <p class="toggle-mode">
        {{ isRegistering ? 'Already have an account?' : 'Don\'t have an account?' }}
        <a @click="toggleMode">{{ isRegistering ? 'Log In' : 'Register' }}</a>
      </p>
    </div>
    
    <!-- Forgot Password Modal -->
    <div v-if="showForgotPasswordModal" class="modal">
      <div class="modal-content">
        <h3>Reset Your Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        <div class="input-group">
          <label for="resetEmail">Email</label>
          <div class="input-wrapper">
            <span class="input-icon">✉️</span>
            <input 
              id="resetEmail"
              v-model="resetEmail" 
              type="email" 
              placeholder="your@email.com" 
              required 
            />
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="cancel-button" @click="closeForgotPassword">Cancel</button>
          <button 
            class="submit-button" 
            :disabled="resetLoading" 
            @click="sendPasswordReset"
          >
            <span v-if="resetLoading" class="spinner"></span>
            <span v-else>Send Reset Link</span>
          </button>
        </div>
        
        <div v-if="resetError" class="error-message">
          <span>⚠️</span>
          <p>{{ resetError }}</p>
        </div>
        
        <div v-if="resetSuccess" class="success-message">
          <span>✅</span>
          <p>{{ resetSuccess }}</p>
        </div>
      </div>
    </div>
    
    <!-- Terms & Privacy Modal -->
    <div v-if="showTermsModal" class="modal">
      <div class="modal-content terms-content">
        <h3>{{ termsModalType === 'terms' ? 'Terms of Service' : 'Privacy Policy' }}</h3>
        <div class="terms-text">
          <p v-if="termsModalType === 'terms'">
            These Terms of Service ("Terms") govern your access to and use of DriveConnect's services. 
            By registering for and using our services, you agree to be bound by these Terms.
          </p>
          <p v-if="termsModalType === 'privacy'">
            Our Privacy Policy explains how we collect, use, and protect your personal information 
            when you use our services. We are committed to protecting your privacy.
          </p>
          <!-- Additional terms content would go here -->
        </div>
        <div class="modal-actions">
          <button class="submit-button" @click="closeTermsModal">I Understand</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/compat/app'; // Compat import
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default {
  name: 'LoginPage',
  data() {
    return {
      // Auth fields
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      accountType: 'business',
      
      // UI state
      isRegistering: false,
      isLoading: false,
      error: '',
      successMessage: '',
      passwordVisible: false,
      rememberMe: false,
      agreeToTerms: false,
      
      // Validation errors
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      nameError: '',
      termsError: '',
      
      // Forgot password
      showForgotPasswordModal: false,
      resetEmail: '',
      resetLoading: false,
      resetError: '',
      resetSuccess: '',
      
      // Terms and privacy
      showTermsModal: false,
      termsModalType: 'terms', // 'terms' or 'privacy'
      
      // App info
      appName: 'DriveConnect'
    };
  },
  computed: {
    passwordStrength() {
      if (!this.password) {
        return { score: 0, text: '', className: '' };
      }
      
      // Calculate password strength
      let score = 0;
      if (this.password.length >= 8) score++;
      if (/[A-Z]/.test(this.password)) score++;
      if (/[0-9]/.test(this.password)) score++;
      if (/[^A-Za-z0-9]/.test(this.password)) score++;
      
      const scoreMap = {
        0: { text: 'Very Weak', className: 'strength-very-weak' },
        1: { text: 'Weak', className: 'strength-weak' },
        2: { text: 'Medium', className: 'strength-medium' },
        3: { text: 'Strong', className: 'strength-strong' },
        4: { text: 'Very Strong', className: 'strength-very-strong' }
      };
      
      return { 
        score, 
        text: scoreMap[score].text, 
        className: scoreMap[score].className 
      };
    },
    isValidForm() {
      return !this.emailError && 
             !this.passwordError && 
             (!this.isRegistering || (!this.nameError && !this.confirmPasswordError));
    }
  },
  methods: {
    // Form navigation methods
    toggleMode() {
      this.isRegistering = !this.isRegistering;
      this.resetForm();
    },
    resetForm() {
      // Reset form fields and errors
      this.error = '';
      this.successMessage = '';
      this.emailError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';
      this.nameError = '';
      this.termsError = '';
      
      // Only reset these fields when toggling modes, not during validation
      if (this.isRegistering) {
        this.confirmPassword = '';
        this.fullName = '';
        this.accountType = 'business';
        this.agreeToTerms = false;
      }
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    
    // Validation methods
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailError = 'Email is required';
      } else if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
      } else {
        this.emailError = '';
      }
    },
    validatePassword() {
      if (!this.password) {
        this.passwordError = 'Password is required';
      } else if (this.isRegistering && this.password.length < 8) {
        this.passwordError = 'Password must be at least 8 characters';
      } else {
        this.passwordError = '';
      }
      
      if (this.confirmPassword) {
        this.validateConfirmPassword();
      }
    },
    validateConfirmPassword() {
      if (this.isRegistering) {
        if (!this.confirmPassword) {
          this.confirmPasswordError = 'Please confirm your password';
        } else if (this.confirmPassword !== this.password) {
          this.confirmPasswordError = 'Passwords do not match';
        } else {
          this.confirmPasswordError = '';
        }
      }
    },
    validateName() {
      if (this.isRegistering && !this.fullName) {
        this.nameError = 'Full name is required';
      } else {
        this.nameError = '';
      }
    },
    validateTerms() {
      if (this.isRegistering && !this.agreeToTerms) {
        this.termsError = 'You must agree to the Terms of Service and Privacy Policy';
        return false;
      }
      this.termsError = '';
      return true;
    },
    validateForm() {
      // Run all validations
      this.validateEmail();
      this.validatePassword();
      if (this.isRegistering) {
        this.validateName();
        this.validateConfirmPassword();
        this.validateTerms();
      }
      
      // Check if form is valid
      return this.isValidForm && (!this.isRegistering || this.agreeToTerms);
    },
    
    // Form submission handlers
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';
      
      try {
        if (this.isRegistering) {
          await this.registerUser();
        } else {
          await this.loginUser();
        }
      } catch (err) {
        console.log('Auth error:', err);
        this.error = this.getReadableErrorMessage(err.message || err.code || 'An unexpected error occurred');
      } finally {
        this.isLoading = false;
      }
    },
    async registerUser() {
      // Create user in Firebase Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(this.email, this.password);
      const user = userCredential.user;
      
      // Update the user profile with their full name
      await user.updateProfile({
        displayName: this.fullName
      });
      
      // Store additional user data in Firestore
      await firebase.firestore().collection('users').doc(user.uid).set({
        email: this.email,
        fullName: this.fullName,
        accountType: this.accountType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      this.successMessage = 'Registration successful! You can now log in.';
      
      // Wait a moment before switching to login mode
      setTimeout(() => {
        this.toggleMode();
      }, 2000);
    },
    async loginUser() {
      const persistence = this.rememberMe ? 
        firebase.auth.Auth.Persistence.LOCAL : 
        firebase.auth.Auth.Persistence.SESSION;
        
      // Set persistence first
      await firebase.auth().setPersistence(persistence);
      
      // Now sign in
      await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
      
      // Navigate to app dashboard
      this.$router.push('/app');
    },
    async socialLogin(provider) {
      this.isLoading = true;
      this.error = '';
      
      let authProvider;
      
      switch(provider) {
        case 'google':
          authProvider = new firebase.auth.GoogleAuthProvider();
          break;
        case 'facebook':
          authProvider = new firebase.auth.FacebookAuthProvider();
          break;
        case 'apple':
          authProvider = new firebase.auth.OAuthProvider('apple.com');
          break;
        default:
          this.isLoading = false;
          return;
      }
      
      try {
        const result = await firebase.auth().signInWithPopup(authProvider);
        const user = result.user;
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        // If new user, save additional profile info
        if (isNewUser) {
          const userProfile = {
            email: user.email,
            fullName: user.displayName || '',
            accountType: 'business', // Default for social logins
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            authProvider: provider
          };
          
          await firebase.firestore().collection('users').doc(user.uid).set(userProfile);
        }
        
        // Navigate to app dashboard
        this.$router.push('/app');
      } catch (err) {
        console.log('Social login error:', err);
        this.error = this.getReadableErrorMessage(err.message || err.code || 'An error occurred during social login');
      } finally {
        this.isLoading = false;
      }
    },
    
    // Password reset handlers
    showForgotPassword() {
      this.resetEmail = this.email;
      this.resetError = '';
      this.resetSuccess = '';
      this.showForgotPasswordModal = true;
    },
    closeForgotPassword() {
      this.showForgotPasswordModal = false;
    },
    async sendPasswordReset() {
      if (!this.resetEmail) {
        this.resetError = 'Please enter your email address';
        return;
      }
      
      this.resetLoading = true;
      
      try {
        await firebase.auth().sendPasswordResetEmail(this.resetEmail);
        this.resetSuccess = 'Password reset link sent! Check your email inbox.';
        
        // Close modal after short delay
        setTimeout(() => {
          this.closeForgotPassword();
        }, 3000);
      } catch (err) {
        console.log('Password reset error:', err);
        this.resetError = this.getReadableErrorMessage(err.message || err.code || 'Failed to send reset email');
      } finally {
        this.resetLoading = false;
      }
    },
    
    // Terms and privacy handlers
    showTerms() {
      this.termsModalType = 'terms';
      this.showTermsModal = true;
    },
    showPrivacy() {
      this.termsModalType = 'privacy';
      this.showTermsModal = true;
    },
    closeTermsModal() {
      this.showTermsModal = false;
    },
    
    // Error handling
    getReadableErrorMessage(errorMsg) {
      // Convert Firebase error messages to more user-friendly ones
      if (errorMsg.includes('auth/wrong-password') || errorMsg.includes('auth/user-not-found')) {
        return 'Invalid email or password. Please try again.';
      } else if (errorMsg.includes('auth/email-already-in-use')) {
        return 'This email is already registered. Try logging in instead.';
      } else if (errorMsg.includes('auth/weak-password')) {
        return 'Please use a stronger password (at least 8 characters).';
      } else if (errorMsg.includes('auth/invalid-email')) {
        return 'Please enter a valid email address.';
      } else if (errorMsg.includes('auth/too-many-requests')) {
        return 'Too many failed login attempts. Please try again later or reset your password.';
      } else if (errorMsg.includes('auth/popup-closed-by-user')) {
        return 'Sign-in popup was closed before completing the process.';
      } else if (errorMsg.includes('auth/network-request-failed')) {
        return 'Network error. Please check your internet connection and try again.';
      }
      return errorMsg;
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  box-sizing: border-box;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  z-index: 1;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3a8ffe 0%, #1a5eff 100%);
  margin-right: 10px;
  position: relative;
  overflow: hidden;
}

.logo::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 60%;
  background-color: rgba(255, 255, 255, 0.9);
  transform: translate(-50%, -50%);
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M3 4a1 1 0 011-1h16a1 1 0 011 1v6h-2V6H5v12h14v-4h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm15.293 10.707L16 12.414V19h-2v-6.586l-2.293 2.293-1.414-1.414L15 8.586l4.707 4.707-1.414 1.414z'/></svg>");
  mask-size: cover;
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M3 4a1 1 0 011-1h16a1 1 0 011 1v6h-2V6H5v12h14v-4h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm15.293 10.707L16 12.414V19h-2v-6.586l-2.293 2.293-1.414-1.414L15 8.586l4.707 4.707-1.414 1.414z'/></svg>");
  -webkit-mask-size: cover;
}

.brand h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: 700;
}

.form-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
  text-align: center;
  font-weight: 600;
}

.form-subtitle {
  color: #666;
  margin: 0 0 24px 0;
  text-align: center;
  font-size: 14px;
}

.input-group {
  margin-bottom: 20px;
  width: 100%;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
  text-align: left;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #aaa;
  font-size: 16px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  border-color: #3a8ffe;
  box-shadow: 0 0 0 3px rgba(58, 143, 254, 0.1);
  outline: none;
}

.error-input input {
  border-color: #e74c3c;
}

.error-input input:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.account-type-selector {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.account-option {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.account-option.active {
  border-color: #3a8ffe;
  background-color: rgba(58, 143, 254, 0.05);
  box-shadow: 0 0 0 3px rgba(58, 143, 254, 0.1);
}

.account-option:hover:not(.active) {
  background-color: #f9f9f9;
}

.account-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.password-strength {
  margin-top: 8px;
}

.strength-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.strength-meter {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s;
}

.strength-very-weak {
  background-color: #e74c3c;
}

.strength-weak {
  background-color: #e67e22;
}

.strength-medium {
  background-color: #f1c40f;
}

.strength-strong {
  background-color: #2ecc71;
}

.strength-very-strong {
  background-color: #27ae60;
}

.strength-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.checkbox-group {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  color: #666;
  font-size: 14px;
}

.checkbox-label input {
  margin-right: 8px;
  margin-top: 3px;
}

.checkbox-label a {
  color: #3a8ffe;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  color: #666;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: #3a8ffe;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3a8ffe 0%, #1a5eff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 94, 255, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  background: linear-gradient(135deg, #a0c4ff 0%, #8aa8ff 100%);
  cursor: not-allowed;
}

.submit-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.3s;
}

.submit-button:hover::after:not(:disabled) {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.cancel-button {
  padding: 14px 20px;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-button:hover {
  background: #f5f5f5;
}

.error-message {
  display: flex;
  align-items: center;
  background: #fff0f0;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #e74c3c;
  animation: fadeIn 0.3s;
}

.success-message {
  display: flex;
  align-items: center;
  background: #f0fff0;
  color: #2ecc71;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #2ecc71;
  animation: fadeIn 0.3s;
}

.error-message span,
.success-message span {
  margin-right: 8px;
  font-size: 18px;
}

.error-message p,
.success-message p {
  margin: 0;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #999;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider span {
  padding: 0 15px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.social-button {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.social-button svg {
  transition: transform 0.2s;
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.social-button:hover svg {
  transform: scale(1.1);
}

.social-button.google {
  color: #ea4335;
}

.social-button.facebook {
  color: #1877f2;
}

.social-button.apple {
  color: #000;
}

.toggle-mode {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 0;
}

.toggle-mode a {
  color: #3a8ffe;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
}

.toggle-mode a:hover {
  text-decoration: underline;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  padding: 20px;
  animation: fadeIn 0.3s;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
}

.terms-content {
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.terms-text {
  margin: 20px 0;
  color: #555;
  line-height: 1.6;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .input-wrapper input {
    padding: 10px 10px 10px 36px;
  }
  
  .social-button {
    width: 45px;
    height: 45px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
}
</style>

<!-- <template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand">
        <div class="logo"></div>
        <h1>{{ appName }}</h1>
      </div>
      
      <h2 class="form-title">{{ isRegistering ? 'Create Account' : 'Welcome Back' }}</h2>
      <p class="form-subtitle">{{ isRegistering ? 'Register as a Business or Driver' : 'Log in to your account' }}</p>
      
      <div v-if="successMessage" class="success-message">
        <span>✅</span>
        <p>{{ successMessage }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <span class="input-icon">✉️</span>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              placeholder="your@email.com" 
              required 
              autocomplete="email"
            />
          </div>
        </div>
        
        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              id="password"
              v-model="password" 
              :type="passwordVisible ? 'text' : 'password'" 
              placeholder="Your password" 
              required 
              autocomplete="current-password"
            />
            <span class="toggle-password" @click="togglePasswordVisibility">
              {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>
        </div>
        
        <div class="remember-forgot">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading" 
          class="submit-button"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ isRegistering ? 'Create Account' : 'Log In' }}</span>
        </button>
        
        <div v-if="error" class="error-message">
          <span>⚠️</span>
          <p>{{ error }}</p>
        </div>
      </form>
      
      <div class="divider">
        <span>or continue with</span>
      </div>
      
      <div class="social-login">
        <button class="social-button google" @click="socialLogin('google')">
          G
        </button>
        <button class="social-button facebook" @click="socialLogin('facebook')">
          f
        </button>
        <button class="social-button apple" @click="socialLogin('apple')">
          
        </button>
      </div>
      
      <p class="toggle-mode">
        {{ isRegistering ? 'Already have an account?' : 'Don\'t have an account?' }}
        <a @click="toggleMode">{{ isRegistering ? 'Log In' : 'Register' }}</a>
      </p>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/compat/app'; // Compat import
import 'firebase/compat/auth';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      isRegistering: true,
      isLoading: false,
      error: '',
      successMessage: '',
      passwordVisible: false,
      rememberMe: false,
      appName: 'DriveConnect'
    };
  },
  methods: {
    toggleMode() {
      this.isRegistering = !this.isRegistering;
      this.error = '';
      this.successMessage = '';
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    async handleSubmit() {
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';
      
      try {
        if (this.isRegistering) {
          await firebase.auth().createUserWithEmailAndPassword(this.email, this.password);
          this.successMessage = 'Registration successful! Now you can log in.';
          // Wait a moment before switching to login mode to let the user see the success message
          setTimeout(() => {
            this.toggleMode();
          }, 2000);
        } else {
          await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
          this.$router.push('/app');
        }
      } catch (err) {
        console.log('Firebase auth error:', err);
        this.error = this.getReadableErrorMessage(err.message || err.code || 'An unexpected error occurred');
      } finally {
        this.isLoading = false;
      }
    },
    getReadableErrorMessage(errorMsg) {
      // Convert Firebase error messages to more user-friendly ones
      if (errorMsg.includes('auth/wrong-password') || errorMsg.includes('auth/user-not-found')) {
        return 'Invalid email or password. Please try again.';
      } else if (errorMsg.includes('auth/email-already-in-use')) {
        return 'This email is already registered. Try logging in instead.';
      } else if (errorMsg.includes('auth/weak-password')) {
        return 'Please use a stronger password (at least 6 characters).';
      } else if (errorMsg.includes('auth/invalid-email')) {
        return 'Please enter a valid email address.';
      }
      return errorMsg;
    },
    socialLogin(provider) {
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';
      
      let authProvider;

      switch(provider) {
        case 'google':
          authProvider = new firebase.auth.GoogleAuthProvider();
          break;
        case 'facebook':
          authProvider = new firebase.auth.FacebookAuthProvider();
          break;
        case 'apple':
          authProvider = new firebase.auth.OAuthProvider('apple.com');
          break;
        default:
          this.isLoading = false;
          return;
      }

      firebase.auth().signInWithPopup(authProvider)
        .then(() => {
          this.$router.push('/app');
        })
        .catch(err => {
          console.log('Social login error:', err);
          this.error = this.getReadableErrorMessage(err.message || err.code || 'An error occurred during social login');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  box-sizing: border-box;
  transition: transform 0.3s;
}

.login-card:hover {
  transform: translateY(-5px);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3a8ffe 0%, #1a5eff 100%);
  margin-right: 10px;
}

.brand h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
  font-weight: 700;
}

.form-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
  text-align: center;
  font-weight: 600;
}

.form-subtitle {
  color: #666;
  margin: 0 0 24px 0;
  text-align: center;
  font-size: 14px;
}

.input-group {
  margin-bottom: 20px;
  width: 100%;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
  text-align: left;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #aaa;
  font-size: 16px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  border-color: #3a8ffe;
  box-shadow: 0 0 0 3px rgba(58, 143, 254, 0.1);
  outline: none;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  color: #666;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: #3a8ffe;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3a8ffe 0%, #1a5eff 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(26, 94, 255, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  background: linear-gradient(135deg, #a0c4ff 0%, #8aa8ff 100%);
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  background: #fff0f0;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #e74c3c;
}

.success-message {
  display: flex;
  align-items: center;
  background: #f0fff0;
  color: #2ecc71;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #2ecc71;
}

.error-message span,
.success-message span {
  margin-right: 8px;
  font-size: 18px;
}

.error-message p,
.success-message p {
  margin: 0;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #999;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider span {
  padding: 0 15px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.social-button {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  cursor: pointer;
  font-weight: bold;
  font-size: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.social-button.google {
  color: #ea4335;
}

.social-button.facebook {
  color: #1877f2;
}

.social-button.apple {
  color: #000;
}

.toggle-mode {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 0;
}

.toggle-mode a {
  color: #3a8ffe;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
}

.toggle-mode a:hover {
  text-decoration: underline;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .input-wrapper input {
    padding: 10px 10px 10px 36px;
  }
  
  .social-button {
    width: 45px;
    height: 45px;
  }
}
</style> -->
