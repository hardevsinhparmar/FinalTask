export async function GetCalls(url) {
    try{
        var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      const res = await fetch (url,requestOptions)
      const data= await res.json()
      return data
    }
    catch(error){console.log('apierror', error)}
}
export async function PostCalls(raw,url){
    var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify(raw);

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      const res = await fetch (url,requestOptions)
      const data= await res.json()
      return data
}
