<?php

namespace Octave\CMSBundle\Service;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Octave\CMSBundle\Entity\MediaCategory;
use Octave\CMSBundle\Entity\MediaItem;
use Octave\CMSBundle\Repository\MediaItemRepository;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class UploadHelper
{
    /** @var MediaItemRepository */
    private $itemRepository;

    /** @var MediaItemManager */
    private $itemManager;

    /** @var string */
    private $uploadPath;

    /** @var string */
    private $webPath;

    /** @var array */
    private $allowedMimeTypes = [
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/svg+xml',
        'text/html'
    ];

    /** @var array */
    private $imageMimeTypes = [
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];

    /**
     * UploadHelper constructor.
     * @param MediaItemRepository $itemRepository
     * @param MediaItemManager $mediaItemManager
     * @param $uploadDir
     * @param $rootDir
     */
    public function __construct(MediaItemRepository $itemRepository, MediaItemManager $mediaItemManager, $uploadDir,
                                $rootDir)
    {
        $this->itemRepository = $itemRepository;
        $this->itemManager = $mediaItemManager;
        $this->uploadPath = $rootDir . '/../web' . $uploadDir . '/';
        $this->webPath = $uploadDir;
    }

    /**
     * @param $files
     * @param MediaCategory|null $category
     * @return array
     * @throws \Exception
     */
    public function upload($files, MediaCategory $category = null)
    {
        if (!is_array($files)) {
            $files = [$files];
        }

        $items = [];

        /** @var UploadedFile $file */
        foreach ($files as $file) {

            if (!$this->validateFile($file)) {
                throw new \Exception(sprintf('Invalid file %s', $file->getClientOriginalName()));
            }

            $newFileName = $this->getNewFilename($file, $category);
            $webPath = $category
                ? $this->webPath . $category->getId() . '/' . $newFileName
                : $this->webPath . $newFileName;

            $item = $this->itemRepository->create();
            $item->setName($newFileName);
            $item->setCategory($category);
            $item->setPath($webPath);
            $item->setSize($file->getClientSize());

            $filePath = $category
                ? $this->uploadPath . $category->getId()
                : $this->uploadPath ;

            if (!is_dir($filePath)) {
                $this->createDir($filePath);
            }

            $this->setFileInfo($item, $file);
            $file->move($filePath, $newFileName);

            $items[] = $item;
        }

        return $items;
    }

    /**
     * @param UploadedFile $file
     * @param MediaItem $item
     * @return MediaItem
     * @throws \Exception
     */
    public function replace(UploadedFile $file, MediaItem $item)
    {
        if (!$this->validateFile($file)) {
            throw new \Exception(sprintf('Invalid file %s', $file->getClientOriginalName()));
        }

        $this->itemManager->deleteItemFile($item);
        $newFileName = $this->getNewFilename($file, $item->getCategory());
        $webPath = $item->getCategory()
            ? $this->webPath . $item->getCategory()->getId() . '/' . $newFileName
            : $this->webPath . $newFileName;

        $item->setName($newFileName);
        $item->setPath($webPath);
        $item->setSize($file->getClientSize());

        $this->setFileInfo($item, $file);

        $filePath = $item->getCategory()
            ? $this->uploadPath . $item->getCategory()->getId()
            : $this->uploadPath;

        if (!is_dir($filePath)) {
            $this->createDir($filePath);
        }

        $file->move($filePath, $newFileName);

        return $item;
    }

    /**
     * @param MediaItem $item
     * @return bool
     */
    public function move(MediaItem $item)
    {
        $fileName = basename($item->getPath());

        $newFilePath = $item->getCategory()
            ? $this->uploadPath . $item->getCategory()->getId() . '/'
            : $this->uploadPath . '/';

        if (!is_dir($newFilePath)) {
            $this->createDir($newFilePath);
        }

        $fs = new Filesystem();
        $originFilePath = str_replace($this->webPath, $this->uploadPath, $item->getPath());

        try {
            $fs->rename($originFilePath, $newFilePath . $fileName );
            $result = true;
        }
        catch (\Exception $e) {
            $result = false;
        }

        if (!$result) {

            $newFileName = sprintf('%s_%s.%s',
                pathinfo($fileName, PATHINFO_FILENAME), time(), pathinfo($fileName, PATHINFO_EXTENSION));

            try {
                $fs->rename($originFilePath, $newFilePath . $newFileName );
                $result = true;
                $fileName = $newFileName;
            }
            catch (\Exception $e) {
                $result = false;
            }
        }

        $webPath = $item->getCategory()
            ? $this->webPath . $item->getCategory()->getId() . '/' . $fileName
            : $this->webPath . $fileName;

        $item->setPath($webPath);

        return $result;
    }

    /**
     * @param MediaItem $item
     * @param UploadedFile $file
     */
    private function setFileInfo(MediaItem $item, UploadedFile $file)
    {
        if ($this->isImage($file)) {
            $this->setImageFileInfo($item, $file);
        }
    }

    /**
     * @param MediaItem $item
     * @param UploadedFile $file
     */
    private function setImageFileInfo(MediaItem $item, UploadedFile $file)
    {
        $imageInfo = @getimagesize($file->getPath() . '/' . $file->getFilename());
        if (!$imageInfo) {
            return;
        }

        $width = $imageInfo[0] ?? 0;
        $height = $imageInfo[1] ?? 0;

        $item->setInfo([
            'width' => $width,
            'height' => $height
        ]);
    }

    /**
     * @param UploadedFile $file
     * @return bool
     */
    private function isImage(UploadedFile $file)
    {
        $mimeType = $this->getFileMimeType($file);
        return in_array($mimeType, $this->imageMimeTypes);
    }

    /**
     * @param UploadedFile $file
     * @return null|string
     */
    private function getFileMimeType(UploadedFile $file)
    {
        $mimeType = @mime_content_type($file->getPath() . '/' . $file->getFilename());
        if (!$mimeType) {
            $mimeType = $file->getClientMimeType();
        }

        return $mimeType;
    }

    /**
     * @param UploadedFile $file
     * @return bool
     */
    private function validateFile(UploadedFile $file)
    {
        $mimeType = $this->getFileMimeType($file);

        if (!in_array($mimeType, $this->allowedMimeTypes)) {
            return false;
        }

        return true;
    }

    /**
     * @param $filename
     * @return string
     */
    private function prepareFilename($filename)
    {
        $filename = strtolower(preg_replace('/[^A-Za-z0-9 _ .-]/', '', $filename));

        return str_replace(' ', '', $filename);
    }

    /**
     * @param $dir
     */
    private function createDir($dir)
    {
        $fs = new Filesystem();
        $fs->mkdir($dir);
    }

    /**
     * @param UploadedFile $file
     * @param MediaCategory $category
     * @return mixed|string
     */
    private function getNewFilename(UploadedFile $file, MediaCategory $category = null)
    {
        $extension = $file->getClientOriginalExtension();
        $newFileName = $this->prepareFilename($file->getClientOriginalName());
        $newFilePath = $category
            ? $this->uploadPath . $category->getId() . '/' . $newFileName
            : $this->uploadPath . $newFileName;

        if (file_exists($newFilePath)) {
            $newFileName = str_replace('.' . $extension, '', $newFileName);
            $newFileName = $this->prepareFilename($newFileName . '_' . time() . '.' . $extension);
        }
        return $newFileName;
    }
}