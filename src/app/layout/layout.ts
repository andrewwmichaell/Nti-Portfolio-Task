import { Component } from '@angular/core';
import { Header } from "./shared/header/header";
import { Footer } from "./shared/footer/footer";
import { Nav } from './shared/nav/nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Header, Nav, RouterOutlet, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {}
