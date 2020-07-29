import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { FormGroup, FormBuilder } from '@angular/forms';
import { interval } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loginForm: FormGroup;
  @ViewChild('video', { static: true }) videoElement: ElementRef;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  videoWidth = 0;
  videoHeight = 0;
  captureImgArr: any = [];

  constructor(public fb: FormBuilder, private renderer: Renderer2, public authenticationService: AuthenticationService, private el: ElementRef) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: [null],
      password: [null]
    });
  }

  submit(form) {
    console.log("login submit", form)
    this.authenticationService.login(form.username, form.password).subscribe(res => {
      console.log("res", res)
    });

    this.startCamera();
  }

  constraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 4096 },
      height: { ideal: 2160 }
    }
  };

  startCamera() {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
    } else {
      alert('Sorry, camera not available.');
    }
  }

  attachVideo(stream) {
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  }

  handleError(error) {
    console.log('Error: ', error);
  }

  capture() {
    this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
    this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
    this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);
    this.captureImgArr.push(this.canvas.nativeElement.toDataURL("image/png"))
    console.log("captureImgArr", this.captureImgArr)
    interval(30000).subscribe(x => {
      // something
      this.capture();
    });

    let formData = new FormData();
    for (let key in this.captureImgArr) {
      let files: Array<File> = this.captureImgArr[key]
      console.log("files", files[0]);
      formData.append('ayn', files[0])
    }
    this.authenticationService.uploadImage(formData).subscribe(res => {
      console.log("image submitted successfully", res)
    })

  }

  // THIS IS ONLY FOR TESTING PURPOSE
  upload() {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#photo');
    console.log("inputEl", inputEl)
    let fileCount: number = inputEl.files.length;
    console.log("fileCount", fileCount)
    // return
    let formData = new FormData();
    if (fileCount > 0) { // a file was selected
      for (let i = 0; i < fileCount; i++) {
        formData.append('ayn', inputEl.files.item(i));
      }
      this.authenticationService.uploadImage(formData).subscribe(res => {
        console.log("image submitted successfully", res)
      });
    }
  }


}
