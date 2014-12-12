<?php

//getUplaodImg
$src_path = 'a.png';
$errMsg = $_FILES["upload_image"]["error"];
//
if ($errMsg > 0){
    $result = array('status'=>'error','msg'=> $errMsg);
}else{
    //success
    $path = $_FILES["upload_image"]["tmp_name"];
    $src = imagecreatefromstring(file_get_contents($path));
    list($imgW, $imgH) = getimagesize($path);
    $final_width = 75;
    $final_height = 75;
    //裁剪区域的宽和高
    $width = 75;
    $height = 75;
    //scale
    if($imgW>=$imgH){
        $final_width = round($final_height * $imgW / $imgH);
    }else{
        $final_height = round($final_width * $imgH / $imgW);
    }
    //scale img
    $new_image = imagecreatetruecolor($width, $height);
    //crop img
    //裁剪开区域左上角的点的坐标
    $x = 0;
    $y = 0;
    imagecopyresampled($new_image, $src, 0, 0, $x, $y, $final_width, $final_height, $imgW, $imgH);
    //输出图片
    $outImg = "upload/file.jpg";
    imagejpeg ($new_image, $outImg, 80);
    //result
    $result = array('status'=>'success','url'=> $outImg);
}


//result
echo json_encode($result);

?>