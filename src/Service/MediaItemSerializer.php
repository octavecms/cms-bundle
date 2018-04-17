<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\MediaItem;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaItemSerializer
{
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
        return [
            'id' => $item->getId(),
            'image' => $item->getPath(),
            'filename' => $item->getName(),
            'parent' => ($item->getCategory()) ? $item->getCategory()->getId() : 'root',
            'width' => $item->getInfoItem('width'),
            'height' => $item->getInfoItem('height'),
            'size' => $item->getSize()
        ];
    }
}