<?php
  //generate html
  $file   = "test txt";
  $file = isset($_POST['content']) ? $_POST['content'] : $file;

  $fp = fopen("tpl-pub.html","r");
  $content  = fread($fp, filesize("tpl-pub.html"));
  $content = str_replace("{ content }",$file,$content);
  // echo $content;
  
  $filename = "result.html";
  $handle    = fopen($filename,"w"); //打开文件指针，创建文件
  /*
　检查文件是否被创建且可写
  */
  if (!is_writable($filename)){ 
     die ("文件：".$filename."不可写，请检查其属性后重试！");
  }
  if (!fwrite($handle,$content)){  //将信息写入文件
     die ("生成文件".$filename."失败！");
  } 
  fclose($handle); //关闭指针
  
  // die ("创建文件".$filename."成功！");

  //generate img
  $time =time();
  //要截图的网址
  $url = 'http://192.168.144.59/jdc/jdcsign/result.html';
  //输出图片的位置与名称
  $out = 'pic/tmp-'.$time.'.png';
  $path = 'DISPLAY=:0 /usr/local/CutyCapt/CutyCapt';//你下载CutyCapt存放的位置
  //size
  $width = 600;
  $height = 80;

  $cmd = "$path --url=$url --out=$out --min-width=$width --min-height=$height";
  exec($cmd);
  echo $out;
?>

