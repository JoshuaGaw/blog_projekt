import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

// Wurzel-Component: rahmt die App ein (Header) und zeigt via <router-outlet>
// die jeweils aktive Route (Liste oder Detail).
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
