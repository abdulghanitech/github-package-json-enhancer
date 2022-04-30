// async function getPackageDetails(name, version) {
//     const endpoint = `http://registry.npmjs.org/${name}/${version}`;
//     const res = await fetch(endpoint);
//     const data = await res.json();
//     console.log(data);
//     return data;
// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.message === "fetch_npm_package") {
//         // getPackageDetails(request.name, request.version);
//     }
// });
