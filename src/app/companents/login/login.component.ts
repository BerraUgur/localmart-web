import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../services/loginRequest';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  private toastr = inject(ToastrService);
  constructor(private authService: AuthService, private router: Router,) { }

  ngOnInit() {
  }


  login() {
    const loginRequest: LoginRequest = { email: this.username, password: this.password };
    this.authService.login(loginRequest).subscribe(
      data => {
        localStorage.setItem('token', data.accessToken??"");
        this.authService.setUserStats();
        this.router.navigate(['/']).then(c=>window.location.reload())
      },
      error => {
        this.toastr.error('Kullanıcı adı veya Şifre hatalı')
        // console.error('Login failed', error);
      }
    );
  }


}
