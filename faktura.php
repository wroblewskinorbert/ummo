<?php
header("Content-type: text/html; charset=UTF-8");
if (!isset($_GET['id'])) die("Spadaj!");

$serverName = "PENTIUM24\INSERTGT";
$uid = "sa";
$pwd = "";
$connectionInfo = array( "UID"=>$uid,
                         "PWD"=>$pwd,
                         "Database"=>"Impet_armatura",
						 "CharacterSet" => "UTF-8");

$conn = sqlsrv_connect( $serverName, $connectionInfo);
if( $conn === false )
{     die( print_r( sqlsrv_errors(), true));}
 
$tsql = "SELECT      dbo.dok_Pozycja.ob_DokHanId, dbo.tblTowar.skrot AS nazwa, dbo.dok_Pozycja.ob_IloscMag AS ilosc, 
                        dbo.dok_Pozycja.ob_CenaNetto AS cena, dbo.dok_Pozycja.ob_Rabat AS rabat, dbo.dok_Pozycja.ob_WartNetto AS wartosc, 
                        dbo.dok_Pozycja.ob_WartBrutto AS brutto
FROM          dbo.dok_Pozycja INNER JOIN
                        dbo.tblTowar ON dbo.dok_Pozycja.ob_TowId = dbo.tblTowar.id
WHERE      dbo.dok_Pozycja.ob_DokHanId = ? ";

/* Set the parameter value. */

$params = array( $_GET['id']);

/* Execute the query. */
$stmt = sqlsrv_query($conn, $tsql, $params);
if( $stmt === false )
{
     echo "Error in statement execution.\n";
     die( print_r( sqlsrv_errors(), true));
}
echo "<table><tr><th>Nazwa</th><th>Ilość<//th><th>Cena<//th><th>Rabat<//th><th>Wartość<//th><//tr>";
$Faktura=array();
$i=0;
while ($mRow=sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC))
{
$i++;
if ($i%2==0){
	$t=" class='alt'" ;
}else{
$t="";
}
echo "<tr ".$t."><td>".$mRow['nazwa']."<//td><td style='text-align:right'>".number_format($mRow['ilosc'])."<//td><td style='text-align:right'>".number_format($mRow['cena'],2)."<//td><td style='text-align:right'>".number_format($mRow['rabat'])."<//td><td style='text-align:right'>".number_format($mRow['wartosc'],2)."<//td><//tr>";
}
echo "</table>";
sqlsrv_free_stmt( $stmt);
sqlsrv_close( $conn);

?>
