<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\MediaItem;
use Symfony\Component\Mime\MimeTypes;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaItemSerializer
{
    /** @var string */
    protected $uploadDir;

    /**
     * MediaItemSerializer constructor.
     * @param $uploadDir
     */
    public function __construct($uploadDir)
    {
        $this->uploadDir = $uploadDir;
    }

    /**
     * @param $items
     * @return array
     */
    public function serialize($items)
    {
        $output = [];

        /** @var MediaItem $item */
        foreach ($items as $item) {
            $output[] = $this->toArray($item);
        }

        return $output;
    }

    /**
     * @param MediaItem $item
     * @return array
     */
    public function toArray(MediaItem $item)
    {
        try {
            $mimeTypes = new MimeTypes();
            $mimeType = $mimeTypes->guessMimeType($this->uploadDir . '/public' . $item->getPath());
            $icon = $mimeTypes->getExtensions($mimeType)[0];
            $isImage = explode('/', $mimeType)[0] === 'image';
        } catch (\Exception $e) {
            $isImage = true;
            $icon = 'file';
        }

        return [
            'id' => $item->getId(),
            'isImage' => $isImage,
            'icon' => 'fa-file',
            'image' => $item->getPath(),
            'path' => $item->getPath(),
            'filename' => $item->getName(),
            'parent' => ($item->getCategory()) ? $item->getCategory()->getId() : 'root',
            'width' => $item->getInfoItem('width'),
            'height' => $item->getInfoItem('height'),
            'size' => $item->getSize()
        ];
    }
}