import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { FotosService } from '../../services/fotos.service';
import { GlobalFunctionsService } from '../../services/global-functions.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { ObraService } from '../../services/obra.service';

@Component({
  selector: 'app-cerrando-visita',
  templateUrl: './cerrando-visita.page.html',
  styleUrls: ['./cerrando-visita.page.scss'],
})
export class CerrandoVisitaPage implements OnInit {

  obraData: any;
  userData: any;
  visitaID: any;
  fotos: any[]=[];
  pictures: any[] = [];
  contador: number = 0;
  takingPhoto: boolean = false;
  comments: string = "";
  comentarios: string[] = [];
  imageToUpload: any;
  index: number = -1;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private file: File,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private geolocation: Geolocation,
    private fotoService: FotosService,
    private obraService: ObraService,
    private loadingController: LoadingController,
    public actionSheetController: ActionSheetController,
    private globFuncService: GlobalFunctionsService) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.obraData = JSON.parse(this.router.getCurrentNavigation().extras.state.obra);
      }
    });
  }

  ngOnInit() {
    this.getVisitaID();
    this.getTiposFotos();
    this.getUserData();
  }

  getVisitaID() {
    this.globFuncService.getDataFromStorage('visitaActualID').then(val => {
      this.visitaID = parseInt(val);
    });
  }

  getTiposFotos() {
    this.globFuncService.getDataFromStorage('visitaActualID').then(value => {
      this.fotoService.obtenerTipoFotosCierre(this.obraData.No_Proyecto_Solicitud, value).subscribe((Response: any) => {
        this.fotos = JSON.parse(Response);
      });
    });
  }

  getUserData() {
    this.globFuncService.getDataFromStorage('userData').then((data) => {
      if (data != null)
        this.userData = JSON.parse(data);
    });
  }

  takePicture(index) {
    this.index = index;
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
      this.takingPhoto = true;
      var currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
      var correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);
      this.copyFileToLocalDir(correctPath, currentName, this.globFuncService.createFileName());
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
    this.pictures.push(this.imageToUpload);
  }

  clearValues() {
    this.takingPhoto = false;
    this.imageToUpload = {};
    this.comments = "";
  }

  probando() {
    this.comentarios.push(this.comments);
    this.fotos[this.index].Foto_Tomada = "SI";
    this.zone.run(() => {
      this.clearValues();
    });
  }






  startUpload(filePath, index) {
    this.file.resolveLocalFilesystemUrl(filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file, index))
      })
      .catch(err => {
        alert('Error al leer archivo.');
      });
  }

  readFile(file: any, index) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      formData.append('', imgBlob, file.name);
      this.uploadImageData(formData, index);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData, index) {
    let loading;
    if (index == 0) {
      loading = await this.loadingController.create({
        message: 'guardando imagenes...',
        spinner: 'crescent'
      });
      await loading.present();
    }
    this.geolocation.getCurrentPosition().then((resp) => {
      let obj = {
        No_Proyecto_Solicitud: this.obraData.No_Proyecto_Solicitud,
        Nombre_Foto: this.pictures[index].name,
        Comentarios: (this.comentarios.length > 0 && this.comentarios[index]) ? this.comentarios[index] : "",
        Usuario: this.userData.Nombre,
        Latitud: resp.coords.latitude.toString(),
        Longitud: resp.coords.longitude.toString(),
        Actualizar_Coordenadas: false,
        Visita_Supervision_ID: this.visitaID,
        Tipo_Foto_Cierre_ID: parseInt(this.fotos[index].Tipo_Foto_Cierre_ID),
        Es_Foto_Cierre: 'SI'
      };
      this.fotoService.uploadPicture(formData, this.obraData.No_Proyecto_Solicitud).subscribe((Res: any) => {
        let data = JSON.parse(Res)[0];
        if (data.Proceso == "OK") {
          this.fotoService.setCloserPictureInfo(obj).subscribe((Response: any) => {
            let dat = JSON.parse(Response)[0];
            if (dat.Estatus == "OK") {
              this.contador++;
              if (this.contador == this.pictures.length) {
                this.obraService.setVisita(this.obraData.No_Proyecto_Solicitud, this.userData.Usuario_ID, false).subscribe((response: any) => {
                  let da = JSON.parse(response)[0];
                  if (da.Proceso == "OK") {
                    loading.dismiss();
                    this.globFuncService.removeDataFromStorage('visitaActualID');
                    this.router.navigate(['listado-obras']);
                    this.globFuncService.showSingleToast('Las imagenes se guardaron correctamente.', 'dark', 2000);
                  }
                }, error => {
                  loading.dismiss();
                  this.globFuncService.showSingleToast('Las imagenes no pudieron ser guardadas.', 'dark', 2000);
                });
              }
            }
          }, error => {
            loading.dismiss();
            this.globFuncService.showSingleToast('Las imagenes no pudieron ser guardadas.', 'dark', 2000);
          });
        }
      }, error => {
        loading.dismiss();
        this.globFuncService.showSingleToast('Las imagenes no pudieron ser guardadas.', 'dark', 2000);
      });
    });
  }

  finish() {
    let flag = true;
    this.fotos.forEach((element, index) => {
      if (element.Foto_Tomada == "NO")
        flag = false;
    });
    if (!flag) {
      this.globFuncService.showSingleAlert('', 'Faltan fotografías', 'Por favor capture todas las fotos indicadas', 'OK');
    }
    else {
      this.contador = 0;
      this.pictures.forEach((element, index) => {
        this.startUpload(element.filePath, index);
      });
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
