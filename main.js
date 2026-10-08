const {app,BrowserWindow,Menu}=require('electron');
app.whenReady().then(()=>{
  Menu.setApplicationMenu(null);
  const w=new BrowserWindow({width:1440,height:860,backgroundColor:'#101218',title:'Buildora',icon:require('path').join(__dirname,'icon.png'),webPreferences:{autoplayPolicy:'no-user-gesture-required'}});
  w.loadFile('index.html');
});
app.on('window-all-closed',()=>app.quit());
