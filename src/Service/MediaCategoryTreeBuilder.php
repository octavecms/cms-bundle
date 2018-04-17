<?php

namespace Octave\CMSBundle\Service;

use Octave\CMSBundle\Entity\MediaCategory;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class MediaCategoryTreeBuilder
{
    /**
     * @param MediaCategory $item
     * @return array
     */
    public function build(MediaCategory $item)
    {
        $output = [
            'id' => $item->getId(),
            'name' => $item->getName(),
            'parent' => ($item->getParent()) ? $item->getParent()->getId() : 'root',
            'children' => []
        ];

        if (!$item->getChildren()) {
            return $output;
        }

        foreach ($item->getChildren() as $child) {
            $output['children'][] = $this->build($child);
        }

        return $output;
    }
}