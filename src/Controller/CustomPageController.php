<?php

namespace Octave\CMSBundle\Controller;

use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Octave\CMSBundle\Entity\Page;
use Octave\CMSBundle\Form\Type\CustomPageType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class CustomPageController extends Controller
{
    /**
     * @param Request $request
     * @param Page|null $page
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editAction(Request $request, Page $page = null)
    {
        $isNew = !$page;
        $repository = $this->get('octave.cms.page.repository');
        $isAdmin = ($this->getParameter('octave.cms.super_admin_role'))
            ? $this->get('security.authorization_checker')
                ->isGranted($this->getParameter('octave.cms.super_admin_role'))
            : true;

        if (!$page) {
            $page = $repository->create();
            $page->setType(\Octave\CMSBundle\Page\Type\CustomPageType::TYPE);
        }

        $form = $this->createForm(CustomPageType::class, $page, [
            'method' => 'post',
            'is_admin' => $isAdmin,
            'locales' => $this->getParameter('locales')
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            /** @var EntityManager $em */
            $em = $this->getDoctrine()->getManager();

            $newOptions = $request->get('option');
            $options = [];
            if (is_array($newOptions)) {
                foreach ($newOptions['name'] as $index => $name) {
                    $value = $newOptions['value'][$index];
                    $options[$name] = $value;
                }
            }
            $page->setOptions($options);

            $em->flush();

            if (!$isNew) {

                if ($request->get('update_and_list')) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_edit', ['id' => $page->getId()]);
                }
            }
            else {
                if ($request->get('create_and_list')) {
                    return $this->redirectToRoute('sitemap_list');
                }
                else {
                    return $this->redirectToRoute('sitemap_page_create_type', [
                        'type' => \Octave\CMSBundle\Page\Type\CustomPageType::TYPE]);
                }
            }
        }

        return $this->render('OctaveCMSBundle:Page:create_custom.html.twig', [
            'form' => $form->createView(),
            'page' => $page,
            'isNew' => $isNew,
            'isAdmin' => $isAdmin
        ]);
    }
}