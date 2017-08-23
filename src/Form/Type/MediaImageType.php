<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaImageType extends AbstractType
{
    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'media_image';
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return HiddenType::class;
    }
}