<?php
header("Content-type: text/html; charset=UTF-8");

$serverName = "PENTIUM24\INSERTGT";
$uid = "sa";
$pwd = "";
$connectionInfo = array( "UID"=>$uid,
                         "PWD"=>$pwd,
                         "Database"=>"Impet_armatura",
						 "CharacterSet" => "UTF-8");

/* Connect using SQL Server Authentication. */
$conn = sqlsrv_connect( $serverName, $connectionInfo);
if( $conn === false )
{
     echo "Unable to connect.</br>";
     die( print_r( sqlsrv_errors(), true));
}




$tsql = "SELECT * 
         FROM dbo.tblPlMiejscowosci
		 ORDER BY nazwa";

$params = array();

/* Execute the query. */
$stmt = sqlsrv_query($conn, $tsql, $params);
if( $stmt === false )
{
     echo "Error in statement execution.\n";
     die( print_r( sqlsrv_errors(), true));
}
	
$Miasta=array();
$nr = 0;
while ($mRow=sqlsrv_fetch_array( $stmt, SQLSRV_FETCH_ASSOC))
{
	$tmp = $mRow['id'];
	$Miasta[$nr]=$mRow;
	$nr++;
}
echo json_encode($Miasta);




/* Free the statement and connection resources. */
sqlsrv_free_stmt( $stmt);
sqlsrv_close( $conn);


?>

