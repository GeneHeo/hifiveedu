import { gapi } from 'gapi-script';

export const uploadFileToDrive = async (file) => {
  const accessToken = gapi.auth.getToken().access_token;
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  return response.json();
};

export const listFilesInDrive = async () => {
  const response = await gapi.client.drive.files.list();
  return response.result.files;
};
