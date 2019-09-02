import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';

@Injectable({
  providedIn: 'root'
})
export class GlobalFunctionsService {

  optionsPicker: ImagePickerOptions = {
    quality: 100,
    outputType: 0,
    maximumImagesCount: 1
  };

  optionsCamera: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };

  constructor(public toastController: ToastController,
    public alertController: AlertController,
    private router: Router,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private webview: WebView,
    private storage: Storage) { }

  async showSingleToast(message, color, duration) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: duration
    });
    toast.present();
  }

  async showSingleAlert(header, subHeader, message, textButton) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: [textButton]
    });
    await alert.present();
  }

  getDataFromStorage(key: string) {
    return this.storage.get(key);
  }

  setDataOnStorage(key: string, value: any) {
    return this.storage.set(key, value);
  }

  removeDataFromStorage(key: string) {
    this.storage.remove(key);
  }

  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  useCamera() {
    return this.camera.getPicture(this.optionsCamera);
  }

  selectFromGallery() {
    return this.imagePicker.getPictures(this.optionsPicker);
  }

}
