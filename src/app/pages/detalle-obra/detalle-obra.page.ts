import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Storage } from '@ionic/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { ObraService } from '../../services/obra.service';
import { GlobalFunctionsService } from '../../services/global-functions.service';
import { FotosService } from '../../services/fotos.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-detalle-obra',
  templateUrl: './detalle-obra.page.html',
  styleUrls: ['./detalle-obra.page.scss'],
})
export class DetalleObraPage {

  pictures: any[] = [];
  comments: string;
  imageToUpload: any;
  obraData: any;
  userData: any;
  takingPhoto: boolean = false;
  optionsCamera: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
  };
  optionsPicker: ImagePickerOptions = {
    quality: 100,
    outputType: 0,
    maximumImagesCount: 1
  };

  constructor(private route: ActivatedRoute,
    private router: Router,
    private camera: Camera,
    private obraService: ObraService,
    private fotoService: FotosService,
    private globFuncService: GlobalFunctionsService,
    public actionSheetController: ActionSheetController,
    private imagePicker: ImagePicker,
    private file: File,
    private storage: Storage,
    private sanitizer: DomSanitizer,
    private geolocation: Geolocation,
    private loadingController: LoadingController,
    private zone: NgZone) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.obraData = JSON.parse(this.router.getCurrentNavigation().extras.state.obra);
      }
    });
  }

  ngOnInit() {
    this.globFuncService.getDataFromStorage('userData').then((data) => {
      if (data != null)
        this.userData = JSON.parse(data);
    })
    this.loadStoredImages();
  }

  loadStoredImages() {
    this.storage.get('pictures').then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.pictures = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.globFuncService.pathForImage(filePath);
          this.pictures.push({ name: img, path: resPath, filePath: filePath });
        }
        //si hay internet subirlas y eliminarlas de localstrage
      }
    });
  }

  async uploadImageData(formData: FormData) {
    const loading = await this.loadingController.create({
      message: 'guardando imagen...',
      spinner: 'crescent'
    });
    await loading.present();
    this.geolocation.getCurrentPosition().then((resp) => {
      let obj = {
        No_Proyecto_Solicitud: this.obraData.No_Proyecto_Solicitud,
        //Visita_Supervision_ID: '',   //Como no existe en este punto un id se manda Null osea no se manda 
        Nombre_Foto: this.imageToUpload.name,
        Comentarios: this.comments,
        Usuario: this.userData.Nombre,
        Latitud: resp.coords.latitude.toString(),
        Longitud: resp.coords.longitude.toString(),
        //Clima_Json: '', //se manda Null osea no se manda IDKW 
        Actualizar_Coordenadas: false, //por default IDKW
        Es_Foto_Cierre: 'NO' //SI ó NO dependiendo el caso
      };
      this.fotoService.uploadPicture(formData, this.obraData.No_Proyecto_Solicitud).subscribe((Res: any) => {
        let data = JSON.parse(Res)[0];
        if (data.Proceso == "OK") {
          this.fotoService.setPictureInfo(obj).subscribe((Response: any) => {
            let dat = JSON.parse(Response)[0];
            if (dat.Estatus == "OK") {
              loading.dismiss();
              this.zone.run(() => {
                this.clearValues();
              });
              this.globFuncService.showSingleToast('La imagen se guardo correctamente.', 'dark', 2000);
            }
          }, error => {
            loading.dismiss();
            this.zone.run(() => {
              this.clearValues();
            });
            this.globFuncService.showSingleToast('La imagen no pudo ser guardada.', 'dark', 2000);
          });
        }
      }, error => {
        loading.dismiss();
        this.zone.run(() => {
          this.clearValues();
        });
        this.globFuncService.showSingleToast('La imagen no pudo ser guardada.', 'dark', 2000);
      });
    });
  }

  useCamera() {
    this.camera.getPicture(this.optionsCamera).then((imageData) => {
      var currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
      var correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);
      this.copyFileToLocalDir(correctPath, currentName, this.globFuncService.createFileName());
    }).finally(() => {
      this.takingPhoto = true;
    });
  }

  selectFromGallery() {
    this.imagePicker.getPictures(this.optionsPicker).then((results) => {
      for (var i = 0; i < results.length; i++) {
        var currentName = results[i].substr(results[i].lastIndexOf('/') + 1);
        var correctPath = results[i].substr(0, results[i].lastIndexOf('/') + 1);
        this.copyFileToLocalDir('file://' + correctPath, currentName, this.globFuncService.createFileName());
      }
      this.takingPhoto = true;
    });
  }

  startVisit() {
    this.obraService.setVisita(this.obraData.No_Proyecto_Solicitud, this.userData.Usuario_ID, true).subscribe((Response: any) => {
      let data = JSON.parse(Response)[0];
      if (data.Visita_Supervision_ID) {
        this.globFuncService.setDataOnStorage('visitaActualID', data.Visita_Supervision_ID);
        let navigationExtras: NavigationExtras = {
          state: {
            obra: JSON.stringify(this.obraData)
          }
        };
        this.router.navigate(['visita'], navigationExtras);
      }
      else {
        this.globFuncService.showSingleAlert('Error', '', data.Mensaje.toLowerCase(), 'Ok');
      }
    }, error => {
      this.globFuncService.showSingleAlert('Error', '', 'Problema ténico avise a soporte', 'Ok');
    });
  }

  updateStoredImages(name) {
    let filePath = this.file.dataDirectory + name;
    let resPath = this.globFuncService.pathForImage(filePath);
    let newEntry = {
      name: name,
      path: resPath,
      filePath: filePath
    };
    //si hay internet
    if (true) {
      this.imageToUpload = newEntry;
    }
    //si NO hay internet
    else {
      this.storage.get('pictures').then(images => {
        let arr = JSON.parse(images);
        if (!arr) {
          let newImages = [name];
          this.storage.set('pictures', JSON.stringify(newImages));
        } else {
          arr.push(name);
          this.storage.set('pictures', JSON.stringify(arr));
        }
        this.pictures = [newEntry, ...this.pictures];
      });
    }
    //hasta aqui si NO hay internet
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      alert('Error al almacenar fotografía.');
    });
  }

  startUpload() {
    this.file.resolveLocalFilesystemUrl(this.imageToUpload.filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file))
      })
      .catch(err => {
        alert('Error al leer archivo.');
      });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      formData.append('', imgBlob, file.name);
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  takePicture() {
    this.showActionSheet();
  }

  async showActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccione...',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => {
            this.useCamera();
          }
        }, {
          text: 'Usar la galería',
          icon: 'images',
          handler: () => {
            this.selectFromGallery();
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }]
    });
    await actionSheet.present();
  }

  clearValues() {
    this.takingPhoto = false;
    this.imageToUpload = {};
    this.comments = "";
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
