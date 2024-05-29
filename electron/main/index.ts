import { app, BrowserWindow, shell, ipcMain, screen } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { dialog } from 'electron'
import fs from 'node:fs';
import { update } from './update'
import { LawAPIConfig } from '../../src/lib/apiconfig';
import { APIs, FetchAPIs, ILaw } from '../../src/lib/apiquery'
import { parseStringPromise } from 'xml2js'
import { ILawTree, LawTree } from '../../src/model/lawmodel'
import { PDFApi } from '../../src/lib/exportAsPdf'
import jsPDF from 'jspdf'
import archiver from 'archiver'
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))



/* API Setting */
const apiConfig = new LawAPIConfig();

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  /* Application Setting */
  const width = 1280;
  const height = 1080;

  /* Display and Window position Setting */
  // const displays = screen.getAllDisplays();
  // const externalDisplays = displays.filter((display) => display.bounds.x != 0 || display.bounds.y != 0)
  // const targetDisplay = externalDisplays[1];

  
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },

    width:width,
    height:height,
    resizable:true,
    // x:targetDisplay.bounds.x + (targetDisplay.bounds.width - width),
    // // x:targetDisplay.bounds.x + (targetDisplay.bounds.width - width)*0.5,
    // y:targetDisplay.bounds.y + (targetDisplay.bounds.height - height)*0.5,
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('apiconfig-setting-id', (_, arg) => {
  try{
    apiConfig.setCurrentId(arg);
    return {result:true, status:"Succedeed"};
  } catch (error) {
    return {result:false, status: error};
  }
})

ipcMain.handle('apiconfig-getting-id', (_) => {
  try{
    const Id = apiConfig.getCurrentId();
    return {result:true, apiId:Id, status:"Succedeed"};
  } catch (error) {
    return {result:false, apiId:"", status: error};
  }
})

ipcMain.handle('api-get-lawlist-fromfile', async (_) => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "법령 목록 XML 가져오기",
      properties: ['openFile'],
      filters: [
        { name: 'XML Files', extensions: ['xml'] },
      ],
    });

    if (canceled) {
      console.log("가져오기 취소.");
      return false;
    }

    return new Promise<{ loaded: boolean, laws?: ILaw[], reason?: any, filename?:string }>((resolve, reject) => {
      fs.readFile(filePaths[0], 'utf-8', async (err, data) => {
        if (err) {
          console.error('파일을 읽는 도중 오류가 발생했습니다.', err);
          reject({ loaded: false, reason: err });
          return;
        }

        try {
          const result = await parseStringPromise(data, { explicitArray: false });
          const laws = result.현행법령목록.법령;
          const parsedLaws = laws.map((law:any) => {
            const lawObject = {
              lawId: parseInt(law.법령ID),
              lawNameKorean: law.법령명,
              lawMST: parseInt(law.법령MST),
              lawDeclareDate: parseInt(law.공포일자),
              lawStartDate: parseInt(law.시행일자),
            }

            return lawObject
          })

          APIs.initiateStorage(parsedLaws);
          resolve({ loaded: true, laws: parsedLaws, filename: path.basename(filePaths[0])});
        } catch (parseError) {
          reject({ loaded: false, reason: parseError });
        }
      });
    });
  } catch (error) {
    console.error('법률 리스트를 받는 도중 오류가 발생했습니다. :', error);
    return { loaded: false, reason: error };
  }
});

ipcMain.handle('api-search-lawbyname', (_, lawName) => {
  return APIs.getMatchLawsByString(lawName);
})

ipcMain.handle('api-get-lawstructure', async (_, lawId) => {
  try {
    return new Promise<{ result: boolean, lawTree:ILawTree, reason?:any }>((resolve, reject) => {
      FetchAPIs.fetchLawStructureById({ apiId: apiConfig.getCurrentId(), lawId: lawId }).then((res) => {
          if(res){
            resolve({result: true, lawTree:res});
          } else {
            reject({result: false, lawTree:res})
          }
      })
    })
  } catch (error) {
    console.error("Error fetching law structure:", error);
    return { result: false, error: error };
  }
})

ipcMain.handle('api-get-lawcontent', async (_, lawTree: ILawTree) => {
  console.log(`Try to get content of ${lawTree.LawInfo.LawTitle}`);
  const targetTree = APIs.getRegisteredTreeById(lawTree.LawInfo.Id);

  // BFS를 통한 트리 순회 및 업데이트
  const nodes: ILawTree[] = [];
  targetTree.GetNodesBFS(nodes);

  // Fetch content for all nodes
  const nodePromises = nodes.map(async (node) => {
      const extracted = await FetchAPIs.fetchLawContentByRootLaw({ apiId: apiConfig.getCurrentId(), node: targetTree });
      if (extracted.result) {
          node.Content = extracted.content;
          console.log(`${node.LawInfo.LawTitle} 본문 업데이트 완료`);
      } else {
          console.log(`${node.LawInfo.LawTitle} 본문 업데이트 실패`);
      }

      // Fetch content for Hanjung rules
      const hanjungPromises = Array.from(node.HanjungRules.values()).map(async (value) => {
          const hanjungContent = await FetchAPIs.fetchHangjungRuleById({ apiId: apiConfig.getCurrentId(), id: value.LawInfo.Id });
          if (hanjungContent.result) {
              value.Content = hanjungContent.content;
              console.log(`${value.LawInfo.LawTitle} 본문 업데이트 완료`);
          } else {
              console.log(`${value.LawInfo.LawTitle} 업데이트 실패`);
          }
      });

      // Wait for all Hanjung rule content fetches to complete
      await Promise.all(hanjungPromises);
  });

  // Wait for all node content fetches to complete
  await Promise.all(nodePromises);

  return targetTree;
});

ipcMain.handle('api-exportaspdf-lawcontent', async (_, lawTrees:Set<ILawTree>) => {

  const lawContents:{ 
    rootLawName:string, 
    subContents: {title:string, content:string}[]
  }[] = [];
  
  lawTrees.forEach((tree) => {
    //최상위법 트리 추출
    console.log(`Try to export ${tree.LawInfo.LawTitle}`);
    const targetTree = APIs.getRegisteredTreeById(tree.LawInfo.Id);
    let lawContent:{ 
      rootLawName:string, 
      subContents: {title:string, content:string}[]
    } = {
      rootLawName: '',
      subContents: []
    };

    lawContent.rootLawName = tree.LawInfo.LawTitle;
    
    const nodes:ILawTree[] = [];
    targetTree.GetNodesBFS(nodes);
    
    nodes.forEach((node) => {
      //법(시행령, 시행규칙)의 본문 추가
      const subContent = {
        title: node.LawInfo.LawTitle,
        content: node.Content ? node.Content: "",
      }
      lawContent.subContents.push(subContent);

      //행정규칙의 본문 추가
      node.HanjungRules.forEach((rule) => {
        const ruleContent = {
          title: rule.LawInfo.LawTitle,
          content: rule.Content ? rule.Content : ""
        };
        
        lawContent.subContents.push(ruleContent);
      });
    })
    lawContents.push(lawContent);
  })
  
  return lawContents;
})

ipcMain.handle('fs-set-folderpath', async (_) => {
  if(win){
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });
  
    if (result.canceled) {
      return null;
    } else {
      return result.filePaths[0];
    }
  } else {
    return null;
  }
})

ipcMain.handle('save-pdfs', async (_, { pdfBuffers, folderPath }) => {
  console.log('---SAVE PDFS---');
  console.log(pdfBuffers);
  console.log(folderPath);
  
  for (const { base64, rootLawName } of pdfBuffers) {
    const buffer = Buffer.from(base64, 'base64');
    const fileName = `${rootLawName}_${getCurrentDateTimeString()}_${generateRandomString(8)}.pdf`;
    const pdfPath = path.join(folderPath, fileName);
    fs.writeFileSync(pdfPath, buffer);
}
  return 'Success';
});

/* Custom Functions */

function getCurrentDateTimeString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
}

function generateRandomString(length: number): string {
  return Math.random().toString(36).substring(2, 2 + length);
}