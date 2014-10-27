
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


$params = array();

if (!isset($_GET['id'])) die ("Nie wybrano firmy!");

$mid=$_GET['id'];

/* Set up the Transact-SQL query. */
$tsql = "SELECT * 
         FROM dbo.tblFirmy 
         WHERE id =  '$mid'";

/* Set the parameter value. */
//$productReviewID = 7180;
//$params = array( $productReviewID);

/* Execute the query. */
$stmt = sqlsrv_query($conn, $tsql, $params);
if( $stmt === false )
{
     echo "Error in statement execution.\n";
     die( print_r( sqlsrv_errors(), true));
}



$firma= array();
$mRow=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC );
	$firma[] = $mRow;

	echo json_encode($firma).";";


/* Free the statement and connection resources. */
sqlsrv_free_stmt( $stmt);
sqlsrv_close( $conn);

?>
