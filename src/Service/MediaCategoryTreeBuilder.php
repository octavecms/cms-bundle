<?php

namespace VideInfra\CMSBundle\Service;

use VideInfra\CMSBundle\Entity\MediaCategory;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
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