<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType as BaseCollectionType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class CollectionType extends AbstractType
{
    /**
     * @return string
     */
    public function getParent()
    {
        return BaseCollectionType::class;
    }

    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'vig_collection';
    }
}