import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; //changes the page in the background, it doesn t reload the page

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {}
