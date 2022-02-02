<?php

namespace Octave\CMSBundle\Service;

use App\Kernel;
use Octave\CMSBundle\Entity\MediaItem;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
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
        $this->webDir = $rootDir . (Kernel::MAJOR_VERSION >= 4 ? '/../public' : '/../web');
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