import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  captureImgArr = [];
  tempArr = [];

  constructor(public fb: FormBuilder, private renderer: Renderer2, public authenticationService: AuthenticationService, private el: ElementRef) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });

    this.startCamera();
    setInterval(() => {
      this.capture();
    }, 30000);
  }

  submit(form) {
    console.log("login submit", form)
    this.authenticationService.login(form.username, form.password).subscribe(res => {
      console.log("res", res)
    });
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

  // attachVideo(stream) {
  //   this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
  // }

  attachVideo(stream) {
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
    this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
      this.videoHeight = this.videoElement.nativeElement.videoHeight;
      this.videoWidth = this.videoElement.nativeElement.videoWidth;
    });
  }

  handleError(error) {
    console.log('Error: ', error);
  }

  capture() {
    this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
    this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
    this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);
    this.captureImgArr.push(this.canvas.nativeElement.toDataURL("image/png"));

    
    for (let i = 0; i < this.captureImgArr.length; i++) {
      console.log(this.captureImgArr[i])
      this.tempArr.push(this.captureImgArr[i]);
    }
    this.tempArr = [...this.tempArr];
    console.log("tempArr", this.tempArr)
    let dataURL: string = this.canvas.nativeElement.toDataURL("image/png");
    const base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    const imageName = 'name.png';
    const imageBlob = this.dataURItoBlob(base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
    let formData = new FormData();
    formData.append('ayn', imageFile)
    this.authenticationService.uploadImage(formData).subscribe(res => {
      console.log("image submitted successfully", res)
    });
    // interval(30000).subscribe(x => {
    //   this.capture();
    // });
    
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

}
