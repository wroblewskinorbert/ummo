<?php
header("Content-type: text/json; charset=UTF-8");

$connStr = 
        'odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)};' .
        'Dbq=d:\\impet\\Impet dane.accdb;';

$db = new PDO($connStr);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
if (isset($_REQUEST['id']))	{
	$id= $_REQUEST['id'];
};
//	$frmId= $_REQUEST['frmId'];
//	//$kiedy= $_REQUEST['kiedy'];
//	$kto= $_REQUEST['kto'];//
//	$opis= $_REQUEST['opis'];
//};
//$params = array( $id );

$sql = 'INSERT INTO tblZdarzenia  (zdTyp, zdRodzic, zdRodzicNabyty, zdFirmaId, zdDataZak, zdTworcaId, zdWykonawcaId, zdOpis, zdZakonczone)  VALUES(10, 0, 0, 1, #11-11-2000#, 4, 4, 12, true)';//,'''$opis''';';
//$sql.= " (mmr_FirmaId, mmr_MaterialId, mmr_Ilosc)";//, zdFirmaId, zdDataZak,zdWykonawcaId, zdOpis, zdId)";
//$sql.= " VALUES( 53123, opis, 88);";//.;//.$frmId.", #01-05-2014#, ".$kto.", ".$opis.");";
$db->query($sql);

$id=95105;
$sql =  "SELECT * FROM tblZdarzenia " .
      " WHERE zdZakonczone = false and zdTyp=10 and zdRodzicNabyty=0 ORDER BY zdId DESC;";
$sth = $db->prepare($sql);
$sth->execute();
$res=array();
while ($row = $sth->fetch()) {
    $res[]=$row;
}
//
echo json_encode($res);
