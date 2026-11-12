const ADMIN_PASSWORD = "DOI_MAT_KHAU_NAY_TRUOC_KHI_DANG_WEB";
const DATA_KEY = "CLASS_11_1_DATA";
function output(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function defaults_() { return {data:{members:[],events:[],honors:[],photos:[]},messages:[]}; }
function doGet(e) {
  const saved = PropertiesService.getScriptProperties().getProperty(DATA_KEY);
  return output({ok:true,data:saved?JSON.parse(saved):defaults_()});
}
function doPost(e) {
  try {
    const p = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (p.action === "login") {
      if (p.password !== ADMIN_PASSWORD) throw new Error("Sai mật khẩu quản trị");
      return output({ok:true});
    }
    if (p.action === "saveMessages") {
      const current = JSON.parse(PropertiesService.getScriptProperties().getProperty(DATA_KEY) || JSON.stringify(defaults_()));
      current.messages = Array.isArray(p.messages) ? p.messages : current.messages;
      PropertiesService.getScriptProperties().setProperty(DATA_KEY, JSON.stringify(current));
      return output({ok:true});
    }
    if (p.password !== ADMIN_PASSWORD) throw new Error("Không có quyền quản trị");
    if (p.action === "save") {
      PropertiesService.getScriptProperties().setProperty(DATA_KEY, JSON.stringify({data:p.data,messages:p.messages||[]}));
      return output({ok:true});
    }
    if (p.action === "upload") {
      const bytes = Utilities.base64Decode(p.base64);
      const blob = Utilities.newBlob(bytes, p.mimeType || "application/octet-stream", p.name || "media");
      const file = DriveApp.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return output({ok:true,url:"https://drive.google.com/uc?export=view&id="+file.getId()});
    }
    throw new Error("Yêu cầu không hợp lệ");
  } catch (err) { return output({ok:false,error:String(err.message || err)}); }
}
