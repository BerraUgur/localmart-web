import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './services/comment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'market_frontend';
  isLogging = false;
  currentRole:any = 1;
  currentRoleText:any = '';
  currentUserId?:Number | any;
  currentUser?:User;
  isVisitor:any = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }
  
  ngOnInit() {
    this.isLogging = this.authService.loggedIn()
    this.currentRole = this.authService.getCurrentRoles()
    console.log(this.currentRole)
    if (this.currentRole == 'User') {
      this.currentRoleText = 'Müşteri'
    }else if (this.currentRole == 'Seller') {
      this.currentRoleText = 'Satıcı'
    }else if (this.currentRole == 'Admin') {
      this.currentRoleText = 'Admin'
    }else{
      this.isVisitor = true
    }

    
    if(this.isLogging){
      this.currentUserId = this.authService.getCurrentUserId()
      this.authService.getUser(this.currentUserId).subscribe(user => {
        this.currentUser = user
        console.log(this.currentUser)
      })
    }
    
  }

  logOut(){
    this.authService.logout()
    this.router.navigate(['/']).then(c=>window.location.reload())
  }
}
