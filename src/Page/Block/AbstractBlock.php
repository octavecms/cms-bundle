<?php

namespace VideInfra\CMSBundle\Page\Block;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
abstract class AbstractBlock implements BlockInterface
{
    /**
     * @return array
     */
    public function getOptions()
    {
        return [];
    }
}