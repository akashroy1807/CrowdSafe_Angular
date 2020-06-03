import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AppService } from '../services/app.service';
import { SubscribeService } from '../services/subscribe.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  submitEnable: boolean = true;
  errorMsg: boolean = false;
  public imagePath;
  imgURL: any;
  imageSrc: any;
  videoFlag: boolean = false;
  sellersPermitFile: any;
  //base64s
  sellersPermitString: string;
  //json
  finalJson: {} = {};
  // errorMsg: boolean = false;
  currentId: number = 0;
  userloader: boolean = false;
  latitude: any;
  longitude: any;
  tokenFlag: boolean = false;
  personCount: any;
  user: string;
  successMsg: string;
  successFlag: boolean = false;
  tokens: number;

  constructor(
    public appservice: AppService,
    public subscribeservice: SubscribeService,
    public router: Router,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    this.subscribeservice.userData.subscribe((user: string) => {
      // console.log(user);
      // user = "a";
      this.user = user;
      console.log(user);
      if (user == null) {
        this.router.navigate(['../login'], { relativeTo: this.route }).catch();
      }
      else{
        this.subscribeservice.token.subscribe((tok: number) => {
          // tok=5;
          this.tokens = tok;
          this.tokenFlag = (tok>0)?true:false;
        });
        this.subscribeservice.setHeader('Upload Images on Crowd Gathering');
        
        this.appservice.getPosition()
        .then(pos=>
        {
          console.log(`Position: ${pos.lng} ${pos.lat}`);
          this.latitude = `${pos.lat}`;
          this.longitude = `${pos.lng}`;
        }).catch((err: any) => {
          this.errorMsg = true;
          this.subscribeservice.setToken(this.tokens - 1);
          console.log(err);
        })
      }
    })
    
  }

  addPictures() {
    this.userloader = true;
    if (this.videoFlag == false) {
      this.finalJson = {
        "image": this.sellersPermitString,
        "lat": this.latitude,
        "long": this.longitude,
        "user": this.user
      }
      this.appservice
      .uploadApi(this.finalJson
      ).then((response: HttpResponse<any>) => {
        console.log(response);
        this.userloader = false;
        if(response.status == 200) {
          this.successFlag = true;
          this.userloader = false;
          this.successMsg = response.body['Person Count'];
          // this.personCount = response.body.
          // this.router.navigate(['../heatmap'], { relativeTo: this.route }).catch();
        }
      }).catch((err: any) => {
        this.userloader = false;
        this.errorMsg = true;
        // this.router.navigate(['../heatmap'], { relativeTo: this.route }).catch();
        console.log(err);
      })
    } else {
      this.finalJson = {
        "video_string": this.sellersPermitString,
        "lat": this.latitude,
        "long": this.longitude,
        "user": this.user
      }
      this.appservice
      .uploadVideoApi(this.finalJson
      ).then((response: HttpResponse<any>) => {
        console.log(response);
        this.userloader = false;
        if(response.status == 200) {
          this.userloader = false;
          this.successFlag = true;
          this.successMsg = response.body['Person Count'];
          // this.router.navigate(['../heatmap'], { relativeTo: this.route }).catch();
        }
      }).catch((err: any) => {
        this.userloader = false;
        this.router.navigate(['../heatmap'], { relativeTo: this.route }).catch();
        console.log(err);
      })
    }
    console.log(this.finalJson);
  }

  public picked(event, field) {
    console.log(event);
    this.currentId = field;
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      if (field == 1) {
        this.sellersPermitFile = file;
        this.handleInputChange(file); //turn into base64
      }
    }
    else {
      alert("No file selected");
    }
  }

  handleInputChange(files) {
    var file = files;
    this.submitEnable=true;
    var pattern1 = /image-*/;
    var pattern2 = /video-*/;
    var reader = new FileReader();
    this.videoFlag = false;
    this.imgURL = "";
    if (!file.type.match(pattern1) && !file.type.match(pattern2)) {
      alert('invalid format');
      return;
    }
    if (file.type.match(pattern1)){
      reader.onload = (_event) => { 
        this.imgURL = reader.result; 
      }
    }
    else{
      this.videoFlag = true;
    }
    this.submitEnable=false;
    
    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    let reader = e.target;
    var base64result = reader.result.substr(reader.result.indexOf(',') + 1);
    //this.imageSrc = base64result;
    let id = this.currentId;
    switch (id) {
      case 1:
        this.sellersPermitString = base64result;
        break
    }

    this.log();
  }

  log() { 
    // for debug
    // console.log('1', this.sellersPermitString);
  }
}
