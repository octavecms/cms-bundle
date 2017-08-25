<?php

namespace VideInfra\CMSBundle\Service;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use VideInfra\CMSBundle\Entity\MediaCategory;
use VideInfra\CMSBundle\Repository\MediaItemRepository;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class UploadHelper
{
    /** @var MediaItemRepository */
    private $itemRepository;

    /** @var string */
    private $uploadPath;

    /** @var string */
    private $webPath;

    private $tmbWidth;

    private $tmbHeight;

    /**
     * UploadHelper constructor.
     * @param MediaItemRepository $itemRepository
     * @param $uploadDir
     * @param $rootDir
     */
    public function __construct(MediaItemRepository $itemRepository, $uploadDir, $rootDir)
    {
        $this->itemRepository = $itemRepository;
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

            $extension = $file->getClientOriginalExtension();
            $newFileName = $this->prepareFilename($file->getClientOriginalName());
            $newFilePath = $this->uploadPath . $newFileName;

            if (file_exists($newFilePath)) {
                $newFileName = str_replace('.' . $extension, '', $newFileName);
                $newFileName = $this->prepareFilename($newFileName.'_'.time() . '.' . $extension);
            }

            $webPath = $this->webPath . $newFileName;

            $file->move($this->uploadPath, $newFileName);

            $item = $this->itemRepository->create();
            $item->setName($newFileName);
            $item->setCategory($category);
            $item->setPath($webPath);
            $item->setSize($file->getClientSize());

            // @TODO Set info

            // @TODO Generate thumbnail

            $items[] = $item;
        }

        return $items;
    }

    /**
     * @param UploadedFile $file
     * @return bool
     */
    private function validateFile(UploadedFile $file)
    {
        // @TODO implement

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
}