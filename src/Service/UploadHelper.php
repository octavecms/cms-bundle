<?php

namespace VideInfra\CMSBundle\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use VideInfra\CMSBundle\Entity\MediaCategory;
use VideInfra\CMSBundle\Entity\MediaItem;
use VideInfra\CMSBundle\Repository\MediaItemRepository;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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
        'image/png'
    ];

    /** @var array */
    private $imageMimeTypes = [
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/png'
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

            $newFileName = $this->getNewFilename($file);
            $webPath = $this->webPath . $newFileName;

            $item = $this->itemRepository->create();
            $item->setName($newFileName);
            $item->setCategory($category);
            $item->setPath($webPath);
            $item->setSize($file->getClientSize());

            $this->setFileInfo($item, $file);
            $file->move($this->uploadPath, $newFileName);

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
        $newFileName = $this->getNewFilename($file);
        $webPath = $this->webPath . $newFileName;

        $item->setName($newFileName);
        $item->setPath($webPath);
        $item->setSize($file->getClientSize());

        $this->setFileInfo($item, $file);
        $file->move($this->uploadPath, $newFileName);

        return $item;
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
        return strtolower(preg_replace('/[^A-Za-z0-9 _ .-]/', '', $filename));
    }

    /**
     * @param UploadedFile $file
     * @return mixed|string
     */
    private function getNewFilename(UploadedFile $file)
    {
        $extension = $file->getClientOriginalExtension();
        $newFileName = $this->prepareFilename($file->getClientOriginalName());
        $newFilePath = $this->uploadPath . $newFileName;

        if (file_exists($newFilePath)) {
            $newFileName = str_replace('.' . $extension, '', $newFileName);
            $newFileName = $this->prepareFilename($newFileName . '_' . time() . '.' . $extension);
        }
        return $newFileName;
    }
}