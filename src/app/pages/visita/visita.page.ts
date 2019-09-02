import { Component, OnInit, NgZone } from '@angular/core';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalFunctionsService } from '../../services/global-functions.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FotosService } from '../../services/fotos.service';

@Component({
  selector: 'app-visita',
  templateUrl: './visita.page.html',
  styleUrls: ['./visita.page.scss'],
})
export class VisitaPage implements OnInit {

  obraData: any;
  userData: any;
  takingPhoto: boolean = false;
  comments: string;
  imageToUpload: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private file: File,
    private storage: Storage,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private geolocation: Geolocation,
    private loadingController: LoadingController,
    private fotoService: FotosService,
    private globFuncService: GlobalFunctionsService,
    public actionSheetController: ActionSheetController) {
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
    });
  }

  bitacora() {

  }

  conceptos() {

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

  useCamera() {
    this.globFuncService.useCamera().then((imageData) => {
      var currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
      var correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);
      this.copyFileToLocalDir(correctPath, currentName, this.globFuncService.createFileName());
    }).finally(() => {
      this.takingPhoto = true;
    });
  }

  selectFromGallery() {
    this.globFuncService.selectFromGallery().then((results) => {
      for (var i = 0; i < results.length; i++) {
        var currentName = results[i].substr(results[i].lastIndexOf('/') + 1);
        var correctPath = results[i].substr(0, results[i].lastIndexOf('/') + 1);
        this.copyFileToLocalDir('file://' + correctPath, currentName, this.globFuncService.createFileName());
      }
      this.takingPhoto = true;
    });
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      alert('Error al almacenar fotografía.');
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
    this.imageToUpload = newEntry;
  }

  clearValues() {
    this.takingPhoto = false;
    this.imageToUpload = {};
    this.comments = "";
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

  async uploadImageData(formData: FormData) {
    const loading = await this.loadingController.create({
      message: 'guardando imagen...',
      spinner: 'crescent'
    });
    await loading.present();
    this.geolocation.getCurrentPosition().then((resp) => {
      let obj = {
        No_Proyecto_Solicitud: this.obraData.No_Proyecto_Solicitud,
        Nombre_Foto: this.imageToUpload.name,
        Comentarios: this.comments,
        Usuario: this.userData.Nombre,
        Latitud: resp.coords.latitude.toString(),
        Longitud: resp.coords.longitude.toString(),
        Actualizar_Coordenadas: false,
        Es_Foto_Cierre: 'NO'
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

  finishVisit() {
    let navigationExtras: NavigationExtras = {
      state: {
        obra: JSON.stringify(this.obraData)
      }
    };
    this.router.navigate(['cerrando-visita'], navigationExtras);
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
