<?php

namespace Octave\CMSBundle\Service;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class ImageProcessor
{
    /** @var string */
    private $uploadPath;

    /** @var string */
    private $tmbPath;

    /** @var string */
    private $tmbWebPath;

    /**
     * ImageProcessor constructor.
     * @param $rootDir
     * @param $uploadDir
     * @param $resizedDir
     */
    public function __construct($rootDir, $uploadDir, $resizedDir)
    {
        $this->uploadPath = $rootDir . '/../web';
        $this->tmbPath = $this->uploadPath . $resizedDir;
        $this->tmbWebPath = $resizedDir;
    }

    /**
     * @param $path
     * @param $width
     * @param $height
     * @return string
     * @throws \Exception
     */
    public function resize($path, $width, $height)
    {
        $fileName = pathinfo($path, PATHINFO_FILENAME);
        $extension = pathinfo($path, PATHINFO_EXTENSION);

        $tmbFileName = sprintf('%s_%sx%s.%s', $fileName, $width, $height, $extension);

        $imagePath = $this->uploadPath . $path;

        if (!realpath($imagePath)) {
            throw new \Exception(sprintf('Image not found: %s', $imagePath));
        }

        if (!file_exists($this->tmbPath)) {
            throw new \Exception(sprintf('No such directory: %s', $this->tmbPath));
        }

        $tmbPath = realpath($this->tmbPath) . '/' . $tmbFileName;
        if (file_exists($tmbPath)) {
            return $this->tmbWebPath . $tmbFileName;
        }

        $mimeType = mime_content_type($imagePath);

        $imagick = new \Imagick(realpath($imagePath));

        if ($mimeType == 'image/png') {
            $imagick->setBackgroundColor(new \ImagickPixel('transparent'));
        }

        $imagick->setImageCompressionQuality(95);
        $imagick->cropThumbnailImage($width, $height);

        $imagick->writeImage($tmbPath);
        $imagick->destroy();

        return $this->tmbWebPath . $tmbFileName;
    }
}