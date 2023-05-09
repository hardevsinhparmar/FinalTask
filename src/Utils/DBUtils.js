import Realm from "realm";
var DB;
export async function openDB(path, schema) {

    DB = await Realm.open({
        path: path,
        schema: [schema]
    })
    console.log('dbused')
}
export async function UseDB(path) {
   DB = new Realm({ path: path })
}

export async function readDB(tblName) {
    try {
        return await DB.objects(tblName);

    } catch (error) {
        throw error;
    }
}
export async function readDBPrimaryKey(tblName, key) {
    try {
        return await DB.objectForPrimaryKey(tblName, key);

    } catch (error) {
        throw error;
    }
}
export async function writeDB(tblName, Obj) {
    try {
       await DB.write(() => { DB.create(tblName, { ...Obj }); });
    } catch (error) {
        throw error;
    }

}
export async function deleteObj(Obj) {
    try {
        await DB.write(() => { DB.delete(Obj) });
    } catch (error) {
        throw error;
    }

}
