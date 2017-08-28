<?php

namespace VideInfra\CMSBundle\Service;

use VideInfra\CMSBundle\Entity\MediaItem;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaItemManager
{
    /** @var string */
    private $webDir;

    /**
     * MediaItemManager constructor.
     * @param $rootDir
     */
    public function __construct($rootDir)
    {
        $this->webDir = $rootDir . '/../web';
    }

    /**
     * @param MediaItem $item
     */
    public function onItemDelete(MediaItem $item)
    {
        $this->deleteItemFile($item);
    }

    /**
     * @param MediaItem $item
     */
    public function deleteItemFile(MediaItem $item)
    {
        if (file_exists($this->webDir . $item->getPath())) {
            @unlink($this->webDir . $item->getPath());
        }
    }
}