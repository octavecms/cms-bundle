<?php

namespace VideInfra\CMSBundle\Service;

use VideInfra\CMSBundle\Entity\MediaItem;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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

            $output[] = [
                'id' => $item->getId(),
                'image' => $item->getPath(),
                'filename' => $item->getName(),
                'parent' => ($item->getCategory()) ? $item->getCategory()->getId() : 'root',
                'width' => $item->getInfoItem('width'),
                'height' => $item->getInfoItem('height'),
                'size' => $item->getSize()
            ];
        }

        return $output;
    }
}