import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;
  returnUrl = '';
  usernameError = '';
  passwordError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/menu';
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.usernameError = '';
    this.passwordError = '';
    this.password = '';
    this.confirmPassword = '';
  }

  validateUsername(): boolean {
    if (this.username.length < 4) {
      this.usernameError = 'Username must be at least 4 characters long';
      return false;
    }
    this.usernameError = '';
    return true;
  }

  validatePassword(): boolean {
    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      return false;
    }
    const specialCharPattern = /[!?#$%@&*()_+=\-\[\]{};:'",.<>\/\\|`~]/;
    if (!specialCharPattern.test(this.password)) {
      this.passwordError = 'Password must contain at least 1 special character (!?#$%...)';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  isFormValid(): boolean {
    if (!this.username.trim() || !this.password.trim()) {
      return false;
    }
    if (!this.isLoginMode) {
      if (!this.validateUsername() || !this.validatePassword()) {
        return false;
      }
      if (this.password !== this.confirmPassword) {
        return false;
      }
    }
    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      if (!this.isLoginMode && this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
      } else {
        this.error = 'Please fill in all fields';
      }
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.isLoginMode) {
      const result = this.authService.login(this.username, this.password);
      this.loading = false;
      
      if (result.success) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.error = result.error || 'Login failed';
      }
    } else {
      const result = this.authService.signup(this.username, this.password);
      this.loading = false;
      
      if (result.success) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.error = result.error || 'Signup failed';
      }
    }
  }
}
